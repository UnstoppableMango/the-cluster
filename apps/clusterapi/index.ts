import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as clusterapi from '@pulumi/crds';
import * as path from 'path';

const config = new pulumi.Config();

const uefiVersion = config.require('uefiVersion');

const crds = new k8s.yaml.ConfigGroup('crds', {
  files: [
    'core/crds.yaml',
    // 'kubeadm-bootstrap/crds.yaml',
    // 'kubeadm-controlplane/crds.yaml',
    // 'metal3/crds.yaml',
    // 'proxmox/crds.yaml',
    'sidero/crds.yaml',
    'talos-bootstrap/crds.yaml',
    'talos-controlplane/crds.yaml',
  ].map(x => path.join('providers', x)),
}, {
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
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
  transformations: [patchControllerManagerPorts],
}, {
  dependsOn: core.ready,
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});

const controlplane = new k8s.yaml.ConfigGroup('controlplane', {
  files: [
    // 'kubeadm-controlplane/resources.yaml',
    'talos-controlplane/resources.yaml',
  ].map(x => path.join('providers', x)),
  transformations: [patchControllerManagerPorts],
}, { dependsOn: bootstrap.ready });

const infrastructure = new k8s.yaml.ConfigGroup('infrastructure', {
  files: [
    // 'metal3/resources.yaml',
    'sidero/resources.yaml',
    // 'proxmox/resources.yaml',
  ].map(x => path.join('providers', x)),
  transformations: [patchKubeRbacProxy, patchSidero],
}, {
  dependsOn: controlplane.ready,
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});

const rpiServerClass = new clusterapi.metal.v1alpha2.ServerClass('rpi4.md', {
  metadata: {
    name: 'rpi4.md',
    namespace: 'sidero-system',
  },
  spec: {
    qualifiers: {
      hardware: [{
        system: {
          family: 'Raspberry Pi'
        },
        memory: {
          totalSize: '4 GB',
        }
      }],
    },
    bootFromDiskMethod: 'ipxe-sanboot',
    configPatches: [{
      op: 'replace',
      path: '/machine/install/disk',
      value: '/dev/mmcblk1' as unknown as Record<string, string>,
    }],
  },
}, { dependsOn: infrastructure.ready });

const ryzenGen1ServerClass = new clusterapi.metal.v1alpha2.ServerClass('ryzen.gen1.md', {
  metadata: {
    name: 'ryzen.gen1.md',
    namespace: 'sidero-system',
  },
  spec: {
    qualifiers: {
      hardware: [{
        compute: {
          processors: [{
            productName: 'AMD Ryzen 7 1700 Eight-Core Processor',
            coreCount: 8,
            speed: 3000,
          }],
        },
        memory: {
          totalSize: '16 GB',
        },
      }],
    },
    configPatches: [{
      op: 'replace',
      path: '/machine/install/disk',
      value: '/dev/sda' as unknown as Record<string, string>,
    }],
  },
}, { dependsOn: infrastructure.ready });

export const rpi4MdServerClassId = rpiServerClass.id;
export const ryzenGen1MdServerClassId = ryzenGen1ServerClass.id;

// Sidero currently has an old rbac-proxy version that doesn't support ARM64
function patchKubeRbacProxy(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;
  obj.spec.template.spec.containers.forEach((x: any) => {
    x.image = x.image.replace('0.4.1', '0.14.1');
  });
}

function patchControllerManagerPorts(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;

  const deployments = ['cabpt-controller-manager', 'cacppt-controller-manager'];

  if (!deployments.includes(obj.metadata.name)) return;

  // Seems to be a bug in the templates. Metrics binds to 8080, but there is no corresponding port
  obj.spec.template.spec.containers[0].ports.push({
    containerPort: 8080,
    name: 'https',
    protocol: 'TCP',
  });
}

function patchSidero(obj: any, opts: pulumi.CustomResourceOptions): void {
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
    image: `ghcr.io/unstoppablemango/raspberrypi4-uefi:${uefiVersion}`,
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
