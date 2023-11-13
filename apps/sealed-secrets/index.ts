import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('sealed-secrets', {
  metadata: { name: 'sealed-secrets' },
});

const chart = new k8s.helm.v3.Chart('sealed-secrets', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: false, // I'll add it to the crds stack later
  values: {
    'sealed-secrets': {
      fullnameOverride: 'sealed-secrets-controller',
    },
  },
});
