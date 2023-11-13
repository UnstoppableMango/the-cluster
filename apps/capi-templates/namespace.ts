import * as k8s from '@pulumi/kubernetes';

export default new k8s.core.v1.Namespace('capi-templates', {
  metadata: { name: 'capi-templates' },
});
