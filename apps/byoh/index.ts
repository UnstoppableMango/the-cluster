import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const chart = new k8s.helm.v3.Chart('byoh', {
  path: './',
}, { provider });
