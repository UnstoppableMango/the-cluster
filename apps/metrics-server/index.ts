import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const ns = new k8s.core.v1.Namespace('metrics-server', {
  metadata: { name: 'metrics-server' },
}, { provider });

const chart = new k8s.helm.v3.Chart('metrics-server', {
  path: './',
  namespace: ns.metadata.name,
}, { provider });
