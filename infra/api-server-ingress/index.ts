import { output } from '@pulumi/pulumi';
import { ClusterTunnel, TunnelBinding } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { Namespace, Service } from '@pulumi/kubernetes/core/v1';
import { provider, theclusterIoTunnelName } from './config';

const ns = Namespace.get('kube-system', 'kube-system', { provider });
const service = Service.get('kubernetes', 'kubernetes', { provider });
const theclusterIoTunnel = ClusterTunnel.get('thecluster.io', theclusterIoTunnelName, { provider });

const tunnel = new TunnelBinding('api-server', {
  metadata: {
    name: 'api-server',
    namespace: ns.metadata.name,
  },
  tunnelRef: {
    kind: 'ClusterTunnel',
    name: output(theclusterIoTunnel.metadata).apply(x => x?.name ?? ''),
  },
  subjects: [{
    name: service.metadata.name,
    spec: {
      target: 'kubernetes.default.svc',
    },
  }],
}, { provider });
