import * as k8s from '@pulumi/kubernetes';

const manifests = new k8s.kustomize.Directory('kubelet-serving-cert-approver', {
  directory: 'https://github.com/UnstoppableMango/kubelet-serving-cert-approver/tree/kustomixe-deprecation/deploy/standalone',
});
