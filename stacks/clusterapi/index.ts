import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as path from 'path';

const core = new k8s.yaml.ConfigFile('core', {
  file: 'providers/core.yaml',
  // transformations: [
  //   (obj: any, opts: pulumi.CustomResourceOptions) => {
  //     if (obj.kind === 'CustomResourceDefinition') {
  //       obj.spec.versions = obj.spec.versions.filter((x: any) => {
  //         const excluded = ['v1alpha1', 'v1alpha2', 'v1alpha3', 'v1alpha4'];
  //         return x.storage || !excluded.includes(x.name);
  //       });
  //     }
  //   },
  // ],
}, {
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle',
    'rules', // SSA conflict for some reason
  ],
});

// const providers = new k8s.yaml.ConfigGroup('providers', {
//   files: [
//     // 'kubeadm-bootstrap.yaml',
//     // 'kubeadm-controlplane.yaml',
//     // 'metal3.yaml',
//     'sidero.yaml',
//     'talos-bootstrap.yaml',
//     'talos-controlplane.yaml',
//   ].map(x => path.join('providers', x)),
// }, { dependsOn: core.ready });
