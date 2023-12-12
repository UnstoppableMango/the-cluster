import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { versions } from './config';

const ns = k8s.core.v1.Namespace.get('cert-manager', 'cert-manager');

// Use a release because the cert-manager helm chart uses hooks
const release = new k8s.helm.v3.Chart('cert-manager', {
  path: './',
  values: {
    // https://github.com/cert-manager/csi-driver/tree/main/deploy/charts/csi-driver#values
    'cert-manager-csi-driver': {
      app: {
        driver: {
          name: 'csi.cert-manager.io',
          csiDataDir: '/tmp/cert-manager-csi-driver',
          useTokenRequest: false,
        },
        kubeletRootDir: '/var/lib/kubelet',
        logLevel: 1,
      },
      image: {
        repository: 'quay.io/jetstack/cert-manager-csi-driver',
        tag: versions.certManagerCsi,
      },
      nodeDriverRegistrarImage: {
        repository: 'registry.k8s.io/sig-storage/csi-node-driver-registrar',
        tag: versions.csiNodeDriverRegistrar,
      },
      resources: {
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    },
  },
}, { provider });

