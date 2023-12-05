import * as path from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';

const capi = new k8s.yaml.ConfigGroup('capi', {
  files: [
    'certificate',
    'clusterrole',
    'clusterrolebinding',
    'deployment',
    'issuer',
    'mutatingwebhookconfiguration',
    'namespace',
    'role',
    'rolebinding',
    'service',
    'serviceaccount',
    'validatingwebhookconfiguration',
  ].map(x => path.join('manifests', `${x}.yaml`)),
}, {
  provider,
  ignoreChanges: [
    // cert-manager injects `caBundle`s
    'spec.conversion.webhook.clientConfig.caBundle',
    // Aggregated ClusterRole will get rules filled in by controlplane
    'rules',
  ],
});
