import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { ClusterTunnel } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { provider, cloudflare, caPem, versions, operatorNamespace, apiSecretsName } from './config';
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

const tunnel = new ClusterTunnel('thecluster.io', {
  metadata: { name: 'thecluster.io' },
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

export const theclusterIoTunnelName = output(tunnel.metadata).apply(x => x?.name);
