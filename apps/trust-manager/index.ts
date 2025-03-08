import * as k8s from '@pulumi/kubernetes';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('trust-manager', {
  metadata: { name: 'trust-manager' },
});

const trustNs = k8s.core.v1.Namespace.get('cert-manager', 'cert-manager');

const chart = new k8s.helm.v3.Chart('trust-manager', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/cert-manager/trust-manager/blob/main/deploy/charts/trust-manager/README.md#values
    'trust-manager': {
      image: {
        repository: 'quay.io/jetstack/trust-manager',
        tag: versions.trustManager,
      },
      app: {
        trust: {
          namespace: trustNs.metadata.name,
        },
      },
      secretTargets: {
        enabled: true,
        // Eh... managing the names manually sounds like hell
        authorizedSecretsAll: true,
      },
      crds: { enabled: true },
      // Redundant, but QoL safeguard
      // https://github.com/cert-manager/trust-manager/blob/01bd331abb8ee071025e2b8989930a2eb3b1d8e9/deploy/charts/trust-manager/values.yaml#L4-L7
      namespace: ns.metadata.name,
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    },
  },
});

export const namespace = ns.metadata.name;
export const trustNamespace = ns.metadata.name;
