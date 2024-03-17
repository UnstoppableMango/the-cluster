import { Namespace, Secret, Service, ServiceAccount } from '@pulumi/kubernetes/core/v1';
import { TunnelBinding } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { fqdn, provider } from './config';
import { ClusterRole, ClusterRoleBinding } from '@pulumi/kubernetes/rbac/v1';

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
      fqdn,
      target: 'https://kubernetes.default.svc',
      caPool: 'kube-root-ca.crt',
    },
  }],
}, { provider });

const sa = new ServiceAccount('admin-pub', {
  metadata: {
    name: 'admin-pub',
    namespace: ns.metadata.name,
  },
}, { provider });

const sec = new Secret('admin-pub', {
  metadata: {
    name: 'admin-pub',
    namespace: ns.metadata.name,
    annotations: {
      'kubernetes.io/service-account.name': sa.metadata.name,
    },
  },
  type: 'kubernetes.io/service-account-token',
}, { provider });

const role = ClusterRole.get('cluster-admin', 'cluster-admin');

const rb = new ClusterRoleBinding('admin-pub', {
  metadata: { name: 'admin-pub' },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: role.kind,
    name: role.metadata.name,
  },
subjects: [{
  kind: sa.kind,
  namespace: ns.metadata.name,
  name: sa.metadata.name,
}],
}, { provider });
