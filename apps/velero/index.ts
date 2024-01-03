import * as k8s from '@pulumi/kubernetes';
import { ConfigMap, Namespace } from '@pulumi/kubernetes/core/v1';
import { clusterIssuers, provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { hosts, versions } from './config';

const ns = new Namespace('velero', {
  metadata: { name: 'velero' },
}, { provider });

const config = new ConfigMap('velero', {
  metadata: {
    name: 'velero',
    namespace: ns.metadata.name,
  },
  data: {
  },
}, { provider });

const secret = new k8s.core.v1.Secret('velero', {
  metadata: {
    name: 'velero',
    namespace: ns.metadata.name,
  },
  stringData: {
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('velero', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: false,
  values: {
    // https://github.com/vmware-tanzu/helm-charts/blob/main/charts/velero/values.yaml
    velero: {
      image: {
        repository: 'velero/velero',
        tag: 'v1.12.2',
      },
      initContainers: [{
        name: 'velero-plugin-for-csi',
        image: 'velero/velero-plugin-for-csi:v0.6.0',
        volumeMounts: [{
          mountPath: '/target',
          name: 'pluginx',
        }],
      }],
      configuration: {
        backupStorageLocation: [{
          name: '',
        }],
      },
    },
  },
}, { provider });

export { hosts };
