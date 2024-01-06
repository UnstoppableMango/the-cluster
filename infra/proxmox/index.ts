import * as pulumi from '@pulumi/pulumi';
import * as pve from '@muhlba91/pulumi-proxmoxve';
import { Versions, Node } from './types';

const config = new pulumi.Config();
const suffix = config.get('suffix') ?? '';
const versions = config.requireObject<Versions>('versions');
const controlPlaneConfig = config.requireObject<Node[]>('controlPlanes');
const workerConfig = config.requireObject<Node[]>('workers');
const iso = config.requireObject<{ node: string }>('iso');
const provider = new pve.Provider('zeus', config.requireObject('proxmox'));
const commonOpts: pulumi.CustomResourceOptions = { provider };

const talosIso = new pve.storage.File(`talos${suffix}`, {
  datastoreId: 'isos',
  nodeName: iso.node,
  overwrite: true,
  sourceFile: {
    path: `https://github.com/siderolabs/talos/releases/download/v${versions.talos}/metal-amd64.iso`,
    checksum: '9bdbd2ecd35fe94298d017bc137540a439ab3ca4c077e24712632aef2d202bf7',
    fileName: `talos-${versions.talos}-metal-amd64.iso`,
  },
}, commonOpts);

const controlPlanes = controlPlaneConfig.map(newNode('c'));
const workers = workerConfig.map(newNode('w'));
const interfaces = pulumi.all([
  ...controlPlanes.map(x => x.networkInterfaceNames),
  ...workers.map(x => x.networkInterfaceNames),
]);

function newNode(type: string): (data: Node, i: number) => pve.vm.VirtualMachine {
  return (data, i) => new pve.vm.VirtualMachine(`px${type}k8s${i}${suffix}`, {
    name: `px${type}k8s${i}${suffix}`,
    nodeName: data.node,
    bios: 'ovmf',
    operatingSystem: {
      type: 'l26',
    },
    efiDisk: {
      datastoreId: 'spool',
      fileFormat: 'raw',
    },
    onBoot: true,
    agent: {
      enabled: true,
    },
    cpu: {
      // https://www.talos.dev/v1.5/talos-guides/install/virtualized-platforms/proxmox/#create-vms
      type: 'host',
      cores: data.cpu,
      units: 1024,
    },
    memory: {
      dedicated: data.mem,
    },
    bootOrders: [
      'scsi0',
      'ide2',
    ],
    cdrom: {
      enabled: true,
      fileId: talosIso.id,
      interface: 'ide2',
    },
    scsiHardware: 'virtio-scsi-single',
    disks: [
      {
        interface: 'scsi0',
        datastoreId: 'spool',
        size: 100,
        ssd: true,
        discard: 'on',
        fileFormat: 'raw',
      },
    ],
    networkDevices: [{
      bridge: data.net,
    }],
  }, {
    ...commonOpts,
    ignoreChanges: ['disks[0].speed'],
  });
}
