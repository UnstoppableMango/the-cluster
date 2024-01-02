import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { driverName, versions } from './config';

const ns = k8s.core.v1.Namespace.get('cert-manager', 'cert-manager');
const chart = new k8s.helm.v3.Chart('cert-manager', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/cert-manager/csi-driver/tree/main/deploy/charts/csi-driver#values
    'cert-manager-csi-driver': {
      app: {
        driver: { name: driverName },
      },
      image: {
        repository: 'quay.io/jetstack/cert-manager-csi-driver',
        tag: versions.certManagerCsi,
      },
      nodeDriverRegistrarImage: {
        repository: 'registry.k8s.io/sig-storage/csi-node-driver-registrar',
        tag: versions.csiNodeDriverRegistrar,
      },
      livenessProbeImage: {
        repository: 'registry.k8s.io/sig-storage/livenessprobe',
        tag: versions.livenessProbe,
      },
      resources: {
        requests: {
          cpu: '10m',
          memory: '64Mi',
        },
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
      tolerations: [{
        key: 'node-role.kubernetes.io/control-plane',
        operator: 'Exists',
        effect: 'NoSchedule',
      }],
      priorityClassName: 'system-cluster-critical',
    },
  },
}, { provider });

export { versions, driverName };
