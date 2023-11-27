import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import { provider } from './clusters';
import { github, hosts } from './config';
import { ingressClass } from './apps/cloudflare-ingress';
import { hostname, realm, provider as keycloakProvider } from './apps/keycloak';

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
    pulumi.interpolate`https://${hostname}/oauth2/callback`,
  ],
}, { provider: keycloakProvider });

const mapper = new keycloak.openid.AudienceProtocolMapper('oauth2-proxy', {
  realmId: realm,
  name: pulumi.interpolate`aud-mapper-${client.clientId}`,
  clientId: client.clientId,
  includedClientAudience: client.clientId,
  addToIdToken: true,
  addToAccessToken: true,
}, { provider: keycloakProvider });

const chart = new k8s.helm.v3.Chart('github', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'oauth2-proxy': {
      replicaCount: 2,
      config: {
        clientID: github.clientId,
        clientSecret: github.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: pulumi.interpolate`https://${hostname}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: pulumi.interpolate`https://${hostname}/realms/${realm}` },
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
