import * as k8s from '@pulumi/kubernetes';

const chart = new k8s.helm.v3.Chart('metallb', {
  path: './',
  skipCRDRendering: true,
  values: {
    metallb: {
      crds: { enabled: false },
      loadBalancerClass: 'metallb',
    },
  },
});
