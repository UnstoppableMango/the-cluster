import * as k8s from '@pulumi/kubernetes';
import { provider, versions } from './config';

const crds = new k8s.kustomize.Directory('snapshot-controller-crds', {
  directory: `https://github.com/kubernetes-csi/external-snapshotter/tree/${versions.externalSnapshotter}/client/config/crd`,
}, { provider });

new k8s.kustomize.Directory('snapshot-controller', {
  directory: `https://github.com/kubernetes-csi/external-snapshotter/tree/${versions.externalSnapshotter}/deploy/kubernetes/snapshot-controller`,
}, { provider, dependsOn: crds.ready });
