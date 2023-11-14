import * as pulumi from '@pulumi/pulumi';
import * as pve from '@muhlba91/pulumi-proxmoxve';
import { Versions, Node } from './types';

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');
const controlPlaneConfig = config.requireObject<Node[]>('controlPlanes');
const workerConfig = config.requireObject<Node[]>('workers');
const provider = new pve.Provider('zeus', config.requireObject('proxmox'));
const commonOpts: pulumi.CustomResourceOptions = { provider };

const pveNodes = [...controlPlaneConfig, ...workerConfig]
  .map(x => x.node)
  .filter((x, i, a) => a.indexOf(x) === i);

const talosIsos = pveNodes.reduce<Record<string, pve.storage.File>>((p, node) => {
  p[node] = new pve.storage.File(`talos-${node}`, {
    datastoreId: 'isos',
    nodeName: node,
    sourceFile: {
      path: `https://github.com/siderolabs/talos/releases/download/v${versions.talos}/metal-amd64.iso`,
      checksum: '9bdbd2ecd35fe94298d017bc137540a439ab3ca4c077e24712632aef2d202bf7',
    },
  }, commonOpts);

  return p;
}, {});

const controlPlanes = controlPlaneConfig.map(newNode('c'));
const workers = workerConfig.map(newNode('w'));

function newNode(type: string): (data: Node, i: number) => pve.vm.VirtualMachine {
  return (data, i) => new pve.vm.VirtualMachine(`px${type}k8s${i}`, {
    nodeName: data.node,
    bios: 'ovmf',
    onBoot: true,
    cpu: {
      // https://www.talos.dev/v1.5/talos-guides/install/virtualized-platforms/proxmox/#create-vms
      type: 'kvm64',
      flags: [
        '+cx16',
        '+lahf_lm',
        '+popcnt',
        '+sse3',
        '+ssse3',
        '+sse4.1',
        '+sse4.2',
      ],
      cores: data.cpu,
    },
    memory: {
      shared: data.mem,
    },
    efiDisk: {
      datastoreId: 'spool',
    },
    disks: [
      {
        interface: 'ide0',
        fileId: talosIsos[data.node].id,
      },
      {
        interface: 'scsi0',
        datastoreId: 'spool',
        size: 100,
        ssd: true,
        discard: 'on',
      },
    ],
    networkDevices: [{
      model: 'virtio',
      bridge: 'vmbr0', // TODO
    }],
  }, commonOpts);
}
