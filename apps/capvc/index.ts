import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const chart = new k8s.helm.v3.Chart('capvc', {
  path: './',
  skipCRDRendering: false,
}, { provider });
