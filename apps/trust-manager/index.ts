import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const ns = new k8s.core.v1.Namespace('trust-manager', {
  metadata: { name: 'trust-manager' },
}, { provider });

const chart = new k8s.helm.v3.Chart('trust-manager', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/cert-manager/trust-manager/blob/main/deploy/charts/trust-manager/README.md#values
    'trust-manager': {
      secretTargets: {
        enabled: true,
        // Consider switching to `authorizedSecrets` so we're not granting
        // cert-manager access to every secret in the cluster
        authorizedSecretsAll: true,
        // authorizedSecrets: [],
      },
      crds: {
        enabled: true,
      },
      // Redundant, but QoL safeguard
      // https://github.com/cert-manager/trust-manager/blob/01bd331abb8ee071025e2b8989930a2eb3b1d8e9/deploy/charts/trust-manager/values.yaml#L4-L7
      namespace: ns.metadata.name,
    },
  },
}, { provider });
