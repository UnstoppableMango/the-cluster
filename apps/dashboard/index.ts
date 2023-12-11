import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { external } from '@unmango/thecluster/realms';
import { clusterIssuers } from '@unmango/thecluster/tls';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { cloudflare as cfIngress, internal as internalIngress } from '@unmango/thecluster/ingress-classes';
import { hosts } from './config';

const ns = new k8s.core.v1.Namespace('dashboard', {
  metadata: { name: 'dashboard' },
}, { provider });

const client = new keycloak.openid.Client('client', {
  realmId: external.realm,
  enabled: true,
  name: 'Kubernetes Dashboard',
  clientId: 'k8s-dashboard',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://${hosts.external}/oauth2/callback`,
    pulumi.interpolate`https://${hosts.internal}/oauth2/callback`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('dashboard', {
  realmId: external.realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const webPort = 8000, apiPort = 9000;
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
        ingress: { enabled: false },
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
        containers: {
          args: ['--enable-skip-login'],
        },
      },
    },
    'external-oauth': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://dashboard-kubernetes-dashboard-web:${webPort}/,http://dashboard-kubernetes-dashboard-api:${apiPort}/api` },
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
      ingress: {
        enabled: true,
        className: cfIngress,
        pathType: 'Prefix',
        // paths: { web: '/', api: '/api/*' },
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
    'internal-oauth': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://dashboard-kubernetes-dashboard-web:${webPort}/,http://dashboard-kubernetes-dashboard-api:${apiPort}/api` },
        { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: 'http://0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://${hosts.internal}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: external.issuerUrl },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_COOKIE_SECURE', value: 'true' },
        { name: 'OAUTH2_PROXY_REVERSE_PROXY', value: 'true' },
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
        { name: 'OAUTH2_PROXY_SKIP_PROVIDER_BUTTON', value: 'true' },
      ],
      ingress: {
        enabled: true,
        className: internalIngress,
        hosts: [hosts.internal],
        annotations: {
          'cert-manager.io/cluster-issuer': clusterIssuers.staging,
        },
        tls: [{
          secretName: 'dashboard-tls',
          hosts: [hosts.internal],
        }],
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
}, { provider, ignoreChanges: ['checksum'] });

export const namespace = ns.metadata.name;
export const service = 'dashboard-kubernetes-dashboard-web';
