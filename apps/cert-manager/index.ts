import * as k8s from '@pulumi/kubernetes';
import { Chart } from '@pulumi/kubernetes/helm/v4';

const ns = new k8s.core.v1.Namespace('cert-manager', {
  metadata: { name: 'cert-manager' },
});

// Use a release because the cert-manager helm chart uses hooks
const release = new Chart('cert-manager', {
  chart: './',
  name: 'cert-manager',
  namespace: ns.metadata.name,
  dependencyUpdate: true,
  values: {
    // https://github.com/cert-manager/cert-manager/blob/master/deploy/charts/cert-manager/README.template.md#configuration
    'cert-manager': {
      crds: { enabled: true },
      podDisruptionBudget: {
        enabled: true,
        minAvailable: 1,
      },
      // Redundant, but QoL safeguard
      // https://github.com/cert-manager/cert-manager/blob/4209de23716562f44f3f7295b1f162bbb69f6ccd/deploy/charts/cert-manager/values.yaml#L98-L101C14
      namespace: ns.metadata.name,
      enableCertificateOwnerRef: true,
    },
  },
});
