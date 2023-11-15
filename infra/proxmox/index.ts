import * as pulumi from '@pulumi/pulumi';
import * as pve from '@muhlba91/pulumi-proxmoxve';
import { Versions, Node } from './types';

const config = new pulumi.Config();
const suffix = config.get('suffix');
const versions = config.requireObject<Versions>('versions');
const controlPlaneConfig = config.requireObject<Node[]>('controlPlanes');
const workerConfig = config.requireObject<Node[]>('workers');
const provider = new pve.Provider('zeus', config.requireObject('proxmox'));
const commonOpts: pulumi.CustomResourceOptions = { provider };

// const pveNodes = [...controlPlaneConfig]
//   .map(x => x.node)
//   .filter((x, i, a) => a.indexOf(x) === i);

// const talosIsos = pveNodes.reduce<Record<string, pve.storage.File>>((p, node) => {
//   p[node] = new pve.storage.File(`talos-${node}${suffix}`, {
//     datastoreId: 'isos',
//     nodeName: node,
//     overwrite: true,
//     sourceFile: {
//       path: `https://mirror.arizona.edu/archlinux/iso/2023.11.01/archlinux-2023.11.01-x86_64.iso`,
//       // checksum: '9bdbd2ecd35fe94298d017bc137540a439ab3ca4c077e24712632aef2d202bf7',
//       // fileName: 'metal-amd64.iso',
//     },
//   }, commonOpts);

//   return p;
// }, {});

const controlPlanes = controlPlaneConfig.map(newNode('c'));
const workers = workerConfig.map(newNode('w'));

function newNode(type: string): (data: Node, i: number) => pve.vm.VirtualMachine {
  return (data, i) => new pve.vm.VirtualMachine(`px${type}k8s${i}${suffix}`, {
    name: `px${type}k8s${i}${suffix}`,
    nodeName: data.node,
    bios: 'ovmf',
    machine: 'q35',
    operatingSystem: {
      type: 'l26',
    },
    onBoot: true,
    cpu: {
      // https://www.talos.dev/v1.5/talos-guides/install/virtualized-platforms/proxmox/#create-vms
      type: 'kvm64',
      // flags: [
      //   '+cx16',
      //   '+lahf_lm',
      //   '+popcnt',
      //   '+sse3',
      //   '+ssse3',
      //   '+sse4.1',
      //   '+sse4.2',
      // ],
      cores: data.cpu,
    },
    memory: {
      dedicated: data.mem,
    },
    bootOrders: [
      'scsi0',
      'ide2',
      'net0',
    ],
    efiDisk: {
      datastoreId: 'spool',
      fileFormat: 'raw',
    },
    disks: [
      {
        interface: 'ide2',
        fileId: `isos:iso/talos-${versions.talos}-metal-amd64.iso`,
      },
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
  }, commonOpts);
}
