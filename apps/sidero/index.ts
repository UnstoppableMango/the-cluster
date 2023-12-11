import * as path from 'node:path';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { loadBalancerClass } from '@unmango/thecluster/apps/metallb';
import { versions } from './config';

const sidero = new k8s.yaml.ConfigGroup('sidero', {
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
  transformations: [patchSideroManager],
}, {
  provider,
  ignoreChanges: [
    // cert-manager injects `caBundle`s
    'spec.conversion.webhook.clientConfig.caBundle',
  ],
});

const sideroLb = new k8s.core.v1.Service('siderolb', {
  metadata: {
    name: 'siderolb',
    namespace: 'sidero-system'
  },
  spec: {
    type: k8s.types.enums.core.v1.ServiceSpecType.LoadBalancer,
    loadBalancerClass,
    ports: [{
      name: 'dhcp',
      port: 67,
      protocol: 'UDP',
      targetPort: 'dhcp',
    }, {
      name: 'http',
      port: 8081,
      protocol: 'TCP',
      targetPort: 'http',
    }, {
      name: 'siderolink',
      port: 51821,
      protocol: 'UDP',
      targetPort: 'siderolink',
    }, {
      name: 'tftp',
      port: 69,
      protocol: 'UDP',
      targetPort: 'tftp',
    }],
    selector: {
      app: 'sidero',
      'cluster.x-k8s.io/provider': 'sidero',
      'cluster.x-k8s.io/v1alpha3': 'v1alpha3',
      'cluster.x-k8s.io/v1alpha4': 'v1alpha3',
      'cluster.x-k8s.io/v1beta1': 'v1alpha3',
      'control-plane': 'sidero-controller-manager',
    },
  },
}, { provider, dependsOn: sidero.ready });

function patchSideroManager(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;
  if (obj.metadata.name !== 'sidero-controller-manager') return;

  if (!obj.spec.template.spec.volumes) {
    obj.spec.template.spec.volumes = [];
  }

  obj.spec.template.spec.volumes.push({
    name: 'tftp-folder',
    emptyDir: {},
  });

  if (!obj.spec.template.spec.initContainers) {
    obj.spec.template.spec.initContainers = [];
  }

  obj.spec.template.spec.initContainers.push({
    image: `ghcr.io/unstoppablemango/raspberrypi4-uefi:${versions.uefi}`,
    imagePullPolicy: 'Always',
    name: 'tftp-folder-setup',
    command: ['cp'],
    args: ['-r', '/tftp', '/var/lib/sidero'],
    volumeMounts: [{
      mountPath: '/var/lib/sidero/tftp',
      name: 'tftp-folder',
    }],
  });

  obj.spec.template.spec.containers.find((x: any) => x.name === 'manager').volumeMounts.push({
    mountPath: '/var/lib/sidero/tftp',
    name: 'tftp-folder',
  });
}
