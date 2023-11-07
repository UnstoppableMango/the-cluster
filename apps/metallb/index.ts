import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('metallb-system', {
  metadata: { name: 'metallb-system' },
});

const chart = new k8s.helm.v3.Chart('metallb', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: true,
  values: {
    metallb: {
      crds: { enabled: false },
    },
  },
});
