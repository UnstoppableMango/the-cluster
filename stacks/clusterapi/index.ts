import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as path from 'path';

const crds = new k8s.yaml.ConfigGroup('crds', {
  files: [
    'core/crds.yaml',
    // 'kubeadm-bootstrap/crds.yaml',
    // 'kubeadm-controlplane/crds.yaml',
    // 'metal3/crds.yaml',
    'proxmox/crds.yaml',
    'sidero/crds.yaml',
    'talos-bootstrap/crds.yaml',
    'talos-controlplane/crds.yaml',
  ].map(x => path.join('providers', x)),
});

const core = new k8s.yaml.ConfigFile('core', {
  file: 'providers/core/resources.yaml',
}, {
  dependsOn: crds.ready,
  // Would be nice to find a way to ignore just the aggregated manager role rules, not all rules
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
    'rules', // Aggregated ClusterRole will get rules filled in by controlplane
  ],
});

const bootstrap = new k8s.yaml.ConfigGroup('bootstrap', {
  files: [
    // 'kubeadm-bootstrap/resources.yaml',
    'talos-bootstrap/resources.yaml',
  ].map(x => path.join('providers', x)),
}, { dependsOn: core.ready });

const controlplane = new k8s.yaml.ConfigGroup('controlplane', {
  files: [
    // 'kubeadm-controlplane/resources.yaml',
    'talos-controlplane/resources.yaml',
  ].map(x => path.join('providers', x)),
}, { dependsOn: bootstrap.ready });

const infrastructure = new k8s.yaml.ConfigGroup('infrastructure', {
  files: [
    // 'metal3/resources.yaml',
    'sidero/resources.yaml',
  ].map(x => path.join('providers', x)),
  transformations: [patchKubeRbacProxy],
}, { dependsOn: controlplane.ready });

function patchKubeRbacProxy(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;
  obj.spec.template.spec.containers.forEach((x: any) => {
    x.image = x.image.replace('0.4.1', '0.14.1');
  });
}
