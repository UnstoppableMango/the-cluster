import * as pulumi from '@pulumi/pulumi';
import * as metal from '@pulumi/crds/metal/v1alpha2';
import * as env from '../environments';

export default new metal.Server('pik8s1', {
  metadata: { name: '00c03115-0000-0000-0000-d83add424101' },
  spec: {
    accepted: true,
    pxeBootAlways: true,
    bootFromDiskMethod: 'ipxe-sanboot',
    // environmentRef: {
    //   name: pulumi.output(env.rpi.metadata).apply(x => x?.name ?? ''),
    //   namespace: 'default',
    // },
    hardware: {
      system: {
        family: 'Raspberry Pi',
        manufacturer: 'Raspberry Pi Foundation',
        productName: 'Raspberry Pi 4 Model B',
        serialNumber: '0000D83ADD424101',
        skuNumber: '0000000000C03115',
      }
    },
    configPatches: [{
      op: 'replace',
      path: '/machine/install/disk',
      value: '/dev/mmcblk1' as unknown as Record<string, any>,
    }, {
      op: 'add',
      path: '/machine/sysctls',
      value: {
        'kernel.kexec_load_disabled': 1,
      },
    }, {
      op: 'add',
      path: '/machine/install/extraKernelArgs',
      value: ['talos.board=rpi_generic'],
    }],
  },
}, {
  ignoreChanges: [
    'cpu',
    'system',
    'hardware',
  ],
});
