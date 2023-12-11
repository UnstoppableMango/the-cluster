import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { external } from '@unmango/thecluster/realms';
import { hosts, versions } from './config';

const ns = new k8s.core.v1.Namespace('sealed-secrets', {
  metadata: { name: 'sealed-secrets' },
}, { provider });

const client = new keycloak.openid.Client('drone', {
  realmId: external.realm,
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
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('drone', {
  realmId: external.realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const role = new keycloak.Role('sealed-secrets', {
  realmId: external.realm,
  name: 'Bitnami Labs Sealed Secrets',
}, { provider: keycloakProvider });

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
        ingressClassName: internalIngress,
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
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: external.issuerUrl },
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
        className: cfIngress,
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
