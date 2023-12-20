import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { } from './config';

const ns = k8s.core.v1.Namespace.get('postgres', 'postgres', { provider });
const chart = new k8s.helm.v3.Chart('postgres', {
  path: './',
  namespace: ns.metadata.name,
  values: {},
  transformations: [],
}, { provider });
