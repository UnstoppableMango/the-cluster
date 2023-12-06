import * as path from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';

const proxmox = new k8s.yaml.ConfigGroup('proxmox', {
  files: [
    'certificate',
    'clusterrole',
    'clusterrolebinding',
    'deployment',
    'issuer',
    'namespace',
    'role',
    'rolebinding',
    'service',
    'validatingwebhookconfiguration',
  ].map(x => path.join('manifests', `${x}.yaml`)),
  transformations: [patchProxmoxService],
}, {
  provider,
  ignoreChanges: [
    // cert-manager injects `caBundle`s
    'spec.conversion.webhook.clientConfig.caBundle',
  ],
});

function patchProxmoxService(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Service') return;
  if (obj.metadata.name !== 'cluster-api-provider-proxmox-controller-manager-metrics-service') return;

  obj.metadata.labels['control-plane'] = 'capp-controller-manager';
  obj.spec.selector['control-plane'] = 'capp-controller-manager';
  obj.spec.selector['cluster.x-k8s.io/aggregate-to-manager'] = undefined
}
