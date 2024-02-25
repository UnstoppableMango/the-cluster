import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { ClusterTunnel } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { provider, cloudflare, caPem, versions, operatorNamespace, apiSecretsName, tunnels } from './config';
import { interpolate, output } from '@pulumi/pulumi';

const ns = new Namespace('cloudflare-tunnels', {
  metadata: { name: 'cloudflare-tunnels' },
}, { provider });

const kubeRootCa = ConfigMap.get('kube-root-ca.crt', 'kube-system/kube-root-ca.crt');

const secret = new Secret('origin-ca-pool', {
  metadata: {
    name: 'origin-ca-pool',
    namespace: operatorNamespace,
  },
  stringData: {
    'kube-root-ca.crt': kubeRootCa.data.apply(x => x['ca.crt']),
    'tls.crt': caPem,
  },
}, { provider });

const credentialsId = interpolate`${operatorNamespace}/${apiSecretsName}`;
const credentials = Secret.get('credentials', credentialsId, { provider });

tunnels.map(t => new ClusterTunnel(t.name, {
  metadata: { name: t.name },
  spec: {
    newTunnel: {
      name: t.name,
    },
    size: t.size,
    originCaPool: secret.metadata.name,
    image: `cloudflare/cloudflared:${versions.cloudflared}`,
    cloudflare: {
      accountId: cloudflare.accountId,
      domain: t.domain,
      email: cloudflare.email,
      secret: credentials.metadata.name,
    },
  },
}, { provider }));

export const tunnelNames = tunnels.map(x => x.name);
