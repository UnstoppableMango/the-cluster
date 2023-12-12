import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const ns = new k8s.core.v1.Namespace('cert-manager', {
  metadata: { name: 'cert-manager' },
}, { provider });

// Use a release because the cert-manager helm chart uses hooks
const release = new k8s.helm.v3.Release('cert-manager', {
  chart: './',
  name: 'cert-manager',
  namespace: ns.metadata.name,
  createNamespace: false,
  atomic: true,
  dependencyUpdate: true,
  lint: true,
  timeout: 60,
  values: {
    // https://github.com/cert-manager/cert-manager/blob/master/deploy/charts/cert-manager/README.template.md#configuration
    'cert-manager': {
      installCRDs: true,
      podDisruptionBudget: {
        enabled: true,
        minAvailable: 1,
      },
      // Redundant, but QoL safeguard
      // https://github.com/cert-manager/cert-manager/blob/4209de23716562f44f3f7295b1f162bbb69f6ccd/deploy/charts/cert-manager/values.yaml#L98-L101C14
      namespace: ns.metadata.name,
      enableCertificateOwnerRef: true,
    },
    // https://github.com/cert-manager/csi-driver/tree/main/deploy/charts/csi-driver#values
    // 'cert-manager-csi-driver': {},
  },
}, { provider });

export const resources = release.resourceNames;
