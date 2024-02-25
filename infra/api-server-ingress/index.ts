import { Namespace, Service } from '@pulumi/kubernetes/core/v1';
import { TunnelBinding } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { provider } from './config';

const ns = Namespace.get('kube-system', 'kube-system', { provider });
const service = Service.get('kubernetes', 'kubernetes', { provider });

const tunnel = new TunnelBinding('api-server', {
  metadata: {
    name: 'api-server',
    namespace: ns.metadata.name,
  },
  tunnelRef: {
    kind: 'ClusterTunnel',
    name: 'thecluster.io',
  },
  subjects: [{
    name: service.metadata.name,
    spec: {
      fqdn: 'pinkdiamond.thecluster.io',
      target: 'https://kubernetes.default.svc',
      caPool: 'kube-root-ca.crt',
    },
  }],
}, { provider });
