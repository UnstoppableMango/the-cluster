import * as pulumi from '@pulumi/pulumi';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { Chart } from '@pulumi/kubernetes/helm/v3';

const ns = new Namespace('minio-operator', {
  metadata: { name: 'minio-operator' },
}, { provider });

const chart = new Chart('minio-operator', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    operator: {

    },
  },
}, { provider });
