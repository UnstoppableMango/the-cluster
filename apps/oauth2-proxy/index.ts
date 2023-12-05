import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from './clusters';
import { hosts } from './config';
import { ingressClass } from './apps/cloudflare-ingress';
import { hostname, realm, provider as keycloakProvider } from './apps/keycloak';
import { host as dashHost } from './apps/dashboard';
import { provider as piholeProvider } from './apps/pihole';

const client = new keycloak.openid.Client('client', {
  realmId: realm,
  enabled: true,
  name: 'OAuth2 Proxy',
  clientId: 'oauth2-proxy',
  accessType: 'CONFIDENTIAL',
  standardFlowEnabled: true,
  directAccessGrantsEnabled: false,
  validRedirectUris: [
    pulumi.interpolate`https://dashboard.thecluster.io/oauth2/callback`,
    pulumi.interpolate`https://dashboard.thecluster.lan/oauth2/callback`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('oauth2-proxy', {
  realmId: realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.id,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const chart = new k8s.helm.v3.Chart('dashboard', {
  path: './',
  namespace: 'dashboard',
  values: {
    'oauth2-proxy': {
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: dashHost },
        // { name: 'OAUTH2_PROXY_PROVIDER', value: 'oidc' },
        // { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://dashboard.thecluster.io/oauth2/callback` },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://dashboard.thecluster.lan/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: pulumi.interpolate`https://${hostname}/realms/${realm}` },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        // { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: '0.0.0.0:4180' },
        { name: 'QAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
      ],
      ingress: {
        enabled: true,
        className: ingressClass,
        pathType: 'Prefix',
        hosts,
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
}, { provider });

const dnsRecord = new pihole.DnsRecord('dashboard', {
  domain: 'dashboard.thecluster.lan',
  ip: '192.168.1.81',
}, { provider: piholeProvider });

export const clientId = client.clientId;
export const clientSecret = pulumi.secret(client.clientSecret);
export const validRedirectUris = client.validRedirectUris;
