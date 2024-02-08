import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { kustomize } from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const ns = new Namespace('ironic', {
  metadata: { name: 'ironic' },
}, { provider });

const secret = new Secret('ironic', {
  metadata: {
    name: 'ironic',
    namespace: ns.metadata.name,
  },
  stringData: {
    IRONIC_HTPASSWD: '',
    IRONIC_INSPECTOR_HTPASSWD: '',
  },
}, { provider });

const app = new kustomize.Directory('ironic', {
  directory: './',
}, { provider });
