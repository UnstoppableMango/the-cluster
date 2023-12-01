import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { provider } from './clusters';
import { hosts } from './config';
import { ingressClass } from './apps/cloudflare-ingress';
import { hostname, realm, provider as keycloakProvider } from './apps/keycloak';
import { host as dashHost } from './apps/dashboard';

const ns = new k8s.core.v1.Namespace('oauth2-proxy', {
  metadata: { name: 'oauth2-proxy' },
}, { provider });

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
  ],
}, { provider: keycloakProvider });

// This is being a pain in the ass. Fix it later
// https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/oauth_provider#keycloak-auth-provider
// https://registry.terraform.io/providers/mrparkers/keycloak/latest/docs/resources/generic_protocol_mapper
// https://www.pulumi.com/registry/packages/keycloak/api-docs/genericprotocolmapper/

// const scope = keycloak.openid.getClientScopeOutput({
//   realmId: realm,
//   name: pulumi.interpolate`${client.clientId}-dedicated`.apply(x => { console.log(x); return x; }),
// }, { provider: keycloakProvider });

// const scope = new keycloak.openid.ClientScope('oauth2-proxy-dedicated', {
//   realmId: realm,
//   name: pulumi.interpolate`${client.clientId}-dedicated`,
// }, { provider: keycloakProvider });

// const mapper = new keycloak.GenericProtocolMapper('oauth2-proxy', {
//   realmId: realm,
//   // name: 'oauth2-proxy',
//   clientId: client.clientId,
//   // clientScopeId: pulumi.interpolate`${client.clientId}-dedicated`,
//   config: {
//     aud: client.clientId,
//   },
//   protocol: 'openid-connect',
//   protocolMapper: pulumi.interpolate`aud-${client.clientId}`,
// }, { provider: keycloakProvider });

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
  namespace: ns.metadata.name,
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
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://dashboard.thecluster.io/oauth2/callback` },
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
  
          // * Ingress .status.loadBalancer field was not updated with a hostname/IP address.
          // for more information about this error, see https://pulumi.io/xdv72s
          // https://github.com/pulumi/pulumi-kubernetes/issues/1812
          // https://github.com/pulumi/pulumi-kubernetes/issues/1810
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
}, { provider });

export const clientId = client.clientId;
export const clientSecret = pulumi.secret(client.clientSecret);
export const validRedirectUris = client.validRedirectUris;
