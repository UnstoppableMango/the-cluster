import * as path from 'path';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const vcluster = new k8s.yaml.ConfigGroup('vcluster', {
  files: [
    'clusterrole',
    'clusterrolebinding',
    'configmap',
    'deployment',
    'namespace',
    'role',
    'rolebinding',
    'service',
    'serviceaccount',
  ].map(x => path.join('manifests', `${x}.yaml`)),
}, {
  provider,
  ignoreChanges: [
    // cert-manager injects `caBundle`s
    'spec.conversion.webhook.clientConfig.caBundle',
  ],
});
