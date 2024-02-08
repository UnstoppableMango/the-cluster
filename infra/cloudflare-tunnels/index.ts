import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { ClusterTunnel } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { provider, cloudflare, caPem } from './config';

const ns = new Namespace('cloudflare-tunnels', {
  metadata: { name: 'cloudflare-tunnels' },
}, { provider });

const secret = new Secret('cloudflare-secrets', {
  metadata: {
    name: 'cloudflare-secrets',
    namespace: ns.metadata.name,
  },
  stringData: {
    CLOUDFLARE_API_TOKEN: cloudflare.apiToken,
    CLOUDFLARE_API_KEY: cloudflare.globalApiKey,
    'tls.crt': caPem, // TODO: Probably find a better spot
  },
}, { provider });

const tunnel = new ClusterTunnel('thecluster.io', {
  metadata: {
    name: 'thecluster.io',
  },
  spec: {
    newTunnel: {
      name: 'thecluster.io',
    },
    size: 3,
    originCaPool: secret.metadata.name,
    cloudflare: {
      accountId: cloudflare.accountId,
      domain: 'thecluster.io',
      email: cloudflare.email,
      secret: secret.metadata.name,
    },
  },
}, { provider });
