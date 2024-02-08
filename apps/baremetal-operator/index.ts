import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { kustomize } from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const app = new kustomize.Directory('baremetal-operator', {
  directory: './',
}, {
  provider,
  dependsOn: [],
});
