import { Secret } from '@pulumi/kubernetes/core/v1';
import { ClusterIssuer } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { ns } from '../namespace';
import { apiToken } from '../config'

export const tokenSecret = new Secret('cloudflare-api-token', {
  metadata: {
    name: 'cloudflare-api-token',
    namespace: ns.metadata.name,
  },
  stringData: {
    'api-token': apiToken.value,
  },
}, { provider });

export const stage = new ClusterIssuer('le-stage-cloudflare', {
  metadata: { name: 'le-stage-cloudflare' },
  spec: {
    acme: {
      privateKeySecretRef: {
        name: 'cloudflare-staging-account-key',
      },
      server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
      solvers: [{
        dns01: {
          cloudflare: {
            apiTokenSecretRef: {
              name: tokenSecret.metadata.name,
              key: 'api-token',
            },
          },
        },
      }],
    },
  },
}, { provider });

export const prod = new ClusterIssuer('le-cloudflare', {
  metadata: { name: 'le-cloudflare' },
  spec: {
    acme: {
      privateKeySecretRef: {
        name: 'cloudflare-account-key',
      },
      server: 'https://acme-v02.api.letsencrypt.org/directory',
      solvers: [{
        dns01: {
          cloudflare: {
            apiTokenSecretRef: {
              name: tokenSecret.metadata.name,
              key: 'api-token',
            },
          },
        },
      }],
    },
  },
}, { provider });
