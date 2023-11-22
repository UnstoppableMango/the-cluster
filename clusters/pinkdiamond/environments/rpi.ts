import * as pulumi from '@pulumi/pulumi';
import * as metal from '@pulumi/crds/metal/v1alpha2';
import { Versions } from '../types';

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');

export default new metal.Environment('rpi', {
  metadata: { name: 'rpi' },
  spec: {
    initrd: {
      url: `https://github.com/siderolabs/talos/releases/download/v${versions.talos}/initramfs-arm64.xz`,
    },
    kernel: {
      url: `https://github.com/siderolabs/talos/releases/download/v${versions.talos}/vmlinuz-arm64`,
      // Stolen from default environment
      args: [
        'console=tty0',
        'console=ttyS0',
        'consoleblank=0',
        'earlyprintk=ttyAMA0,115200', // Changed from ttyS0
        'ima_appraise=fix',
        'ima_hash=sha512',
        'ima_template=ima-ng',
        'init_on_alloc=1',
        'initrd=initramfs.xz',
        'nvme_core.io_timeout=4294967295',
        'printk.devkmsg=on',
        'pti=on',
        'random.trust_cpu=on', // Added
        'slab_nomerge=',
        'talos.platform=metal',
        'talos.board=rpi_generic', // Added
      ],
    },
  },
});
