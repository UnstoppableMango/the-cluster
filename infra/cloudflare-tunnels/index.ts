import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { ClusterTunnel } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { provider, cloudflare, caPem, versions, operatorNamespace, apiSecretsName } from './config';
import { interpolate } from '@pulumi/pulumi';

const ns = new Namespace('cloudflare-tunnels', {
  metadata: { name: 'cloudflare-tunnels' },
}, { provider });

const secret = new Secret('origin-ca-pool', {
  metadata: {
    name: 'origin-ca-pool',
    namespace: ns.metadata.name,
  },
  stringData: {
    'tls.crt': caPem,
  },
}, { provider });

const credentialsId = interpolate`${operatorNamespace}/${apiSecretsName}`;
const credentials = Secret.get('credentials', credentialsId);

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
    image: `cloudflare/cloudflared:${versions.cloudflared}`,
    cloudflare: {
      accountId: cloudflare.accountId,
      domain: 'thecluster.io',
      email: cloudflare.email,
      secret: credentials.metadata.name,
    },
  },
}, { provider });
