import * as path from 'path';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const capi = new k8s.yaml.ConfigGroup('capi', {
  files: [
    'certificate',
    'clusterrole',
    'clusterrolebinding',
    'customresourcedefinition',
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
