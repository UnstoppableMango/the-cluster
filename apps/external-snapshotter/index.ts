import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { versions } from './config';

new k8s.kustomize.Directory('snapshot-controller', {
  directory: `https://github.com/kubernetes-csi/external-snapshotter/tree/${versions.externalSnapshotter}/deploy/kubernetes/snapshot-controller`,
}, { provider });
