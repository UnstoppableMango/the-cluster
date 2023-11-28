import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';

const ns = new k8s.core.v1.Namespace('unifi', {
  metadata: { name: 'unifi' },
}, { provider });

const chart = new k8s.helm.v3.Chart('unifi', {
  path: './',
  namespace: ns.metadata.name,
  values: {},
}, { provider });
