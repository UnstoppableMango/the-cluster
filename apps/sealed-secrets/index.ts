import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { apps, clusterIssuers, ingresses, provider, realms } from '@unmango/thecluster/cluster/from-stack';
import { hosts, versions } from './config';

const ns = new k8s.core.v1.Namespace('sealed-secrets', {
  metadata: { name: 'sealed-secrets' },
}, { provider });

const client = new keycloak.openid.Client('drone', {
  realmId: realms.external.id,
  enabled: true,
  name: 'Drone',
  clientId: 'drone',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://${hosts.external}/oauth2/callback`,
    pulumi.interpolate`https://${hosts.internal}/oauth2/callback`,
  ],
}, { provider: apps.keycloak.provider });

const mapper = new keycloak.openid.AudienceProtocolMapper('drone', {
  realmId: realms.external.id,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: apps.keycloak.provider });

const role = new keycloak.Role('sealed-secrets', {
  realmId: realms.external.id,
  name: 'Bitnami Labs Sealed Secrets',
}, { provider: apps.keycloak.provider });

const port = 8080;
const chart = new k8s.helm.v3.Chart('sealed-secrets', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'sealed-secrets': {
      // fullnameOverride: 'sealed-secrets-controller',
      image: {
        registry: 'docker.io',
        repository: 'bitnami/sealed-secrets-controller',
        tag: versions.sealedSecrets,
      },
      createController: true,
      updateStatus: true,
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
      service: {
        type: 'ClusterIP',
        port,
      },
      ingress: {
        enabled: true,
        ingressClassName: ingresses.internal,
        hostname: hosts.internal,
        annotations: {
          'cert-manager.io/cluster-issuer': clusterIssuers.staging,
        },
        tls: true,
      },
    },
    // This is currently doing nothing since oauth2-proxy isn't currently a dependency,
    // and I'm not sure I should even fix that because I'm wondering if the cert.pem
    // even needs to be exposed publicly...
    'oauth2-proxy': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://sealed-secrets:${port}` },
        { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: 'http://0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://${hosts.external}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: realms.external.issuerUrl },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_COOKIE_SECURE', value: 'true' },
        { name: 'OAUTH2_PROXY_REVERSE_PROXY', value: 'true' },
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
        { name: 'OAUTH2_PROXY_SKIP_PROVIDER_BUTTON', value: 'true' },
      ],
      service: {
        type: 'ClusterIP',
        // clusterIP: '10.102.210.76',
      },
      ingress: {
        enabled: true,
        className: ingresses.cloudflare,
        pathType: 'Prefix',
        hosts: [hosts.external],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          'pulumi.com/skipAwait': 'true',
        },
      },
      resources: {
        limits: {
          cpu: '100m',
          memory: '300Mi',
        },
        requests: {
          cpu: '100m',
          memory: '300Mi',
        },
      },
    },
  },
}, { provider });
