import { Domain, Pool, Volume } from '@pulumi/libvirt';
import * as path from 'node:path';
import { clusterName, stackName } from './config';

// WIP on rpi controlplane to closer match the physical hosts
// const vm = new Domain('controlplane', {
//   type: 'hvm',
//   arch: 'armv8',
//   machine: 'virt-4.2',
//   emulator: '/usr/bin/qemu-system-aarch64',
//   memory: 4096,
// });

const pool = new Pool(`${stackName}-${clusterName}`, {
  type: 'dir',
  path: path.join(__dirname, '.config', 'libvirt'),
});

const volume = new Volume('ubuntu', {
  pool: pool.name,
  source: 'https://cloud-images.ubuntu.com/releases/22.04/release/ubuntu-22.04-server-cloudimg-amd64-disk-kvm.img',
  format: 'qcow2',
});

const vm = new Domain('controlplane', {
  vcpu: 4,
  memory: 4096,
  disks: [{
    volumeId: volume.id,
  }],
  networkInterfaces: [{
    networkName: 'default',
  }],
  consoles: [
    {
      type: 'pty',
      targetPort: '0',
      targetType: 'serial',
    },
    {
      type: 'pty',
      targetPort: '1',
      targetType: 'virtio',
    },
  ],
  graphics: {
    type: 'spice',
    listenType: 'address',
    autoport: true,
  },
});
