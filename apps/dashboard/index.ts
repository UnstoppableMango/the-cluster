import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from './clusters';
import { publicHost, internalHost } from './config';
import { ip, nginxClass } from './apps/nginx-ingress';
import { issuer } from './apps/cert-manager';
import { hostname as keycloakHost, realm, provider as keycloakProvider } from './apps/keycloak';
import { provider as piholeProvider } from './apps/pihole';

const ns = new k8s.core.v1.Namespace('dashboard', {
  metadata: { name: 'dashboard' },
}, { provider });

const client = new keycloak.openid.Client('client', {
  realmId: realm,
  enabled: true,
  name: 'Kubernetes Dashboard',
  clientId: 'k8s-dashboard',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://${publicHost}/oauth2/callback`,
    pulumi.interpolate`https://${internalHost}/oauth2/callback`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('dashboard', {
  realmId: realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const chart = new k8s.helm.v3.Release('dashboard', {
  name: 'dashboard',
  chart: './',
  namespace: ns.metadata.name,
  values: {
    'kubernetes-dashboard': {
      nginx: { enabled: false },
      'cert-manager': { enabled: false },
      'metrics-server': { enabled: false },
      app: {
        ingress: {
          hosts: [internalHost],
          ingressClassName: nginxClass,
          // pathType: 'Prefix',
          // issuer: {
          //   name: issuer,
          //   scope: 'cluster',
          //   // scope: 'disabled',
          // },
          // paths: { web: '/*' },
          // paths: { api: '/api/*' },
          // paths: {
          //   web: '/*',
          //   api: '/api/*',
          // },
          // annotations: {
          //   'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          //   'cloudflare-tunnel-ingress-controller.strrl.dev/ssl-verify': 'false',
          // },
          annotations: {
            // 'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
            'nginx.com/jwt-login-url': `https://${internalHost}/oauth2/login`,
          },
        },
        settings: {
          global: {
            clusterName: 'THECLUSTER',
            // Default values: https://github.com/kubernetes/dashboard/blob/fdc83e5623f44fe52c5c94d245fd490a0b94a60d/charts/helm-chart/kubernetes-dashboard/values.yaml#L60
            itemsPerPage: 10,
            logsAutoRefreshTimeInterval: 5,
            resourceAutoRefreshTimeInterval: 5,
            disableAccessDeniedNotifications: false,
          },
        },
      },
      api: {
        // image: { tag: 'latest' },
        containers: {
          args: ['--enable-skip-login'],
        },
      },
      // web: {
      //   image: { tag: 'latest' },
      // },
    },
    'oauth2-proxy': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        // ...hosts.map(h => ({ name: 'OAUTH2_PROXY_UPSTREAMS', value: h })),
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `https://${internalHost}` },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://${internalHost}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: pulumi.interpolate`https://${keycloakHost}/realms/${realm}` },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        // { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: '0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
      ],
      ingress: {
        enabled: true,
        className: nginxClass,
        // pathType: 'Prefix',
        hosts: [internalHost],
        // annotations: {
        //   'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
        //   'pulumi.com/skipAwait': 'true',
        // },
      },
    },
  },
}, { provider, ignoreChanges: ['checksum'] });

const dnsRecord = new pihole.DnsRecord(internalHost, {
  domain: internalHost,
  ip,
}, { provider: piholeProvider });

export const namespace = ns.metadata.name;
export const service = 'dashboard-kubernetes-dashboard-web';
