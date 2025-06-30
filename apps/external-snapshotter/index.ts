import * as k8s from '@pulumi/kubernetes';
import { versions } from './config';

const crds = new k8s.kustomize.Directory('snapshot-controller-crds', {
	directory:
		`https://github.com/kubernetes-csi/external-snapshotter/tree/${versions.externalSnapshotter}/client/config/crd`,
});

new k8s.kustomize.Directory('snapshot-controller', {
	directory:
		`https://github.com/kubernetes-csi/external-snapshotter/tree/${versions.externalSnapshotter}/deploy/kubernetes/snapshot-controller`,
}, { dependsOn: crds.ready });
