import * as metal from '@pulumi/crds/metal/v1alpha2';

export default new metal.ServerClass('rpi4.md', {
  metadata: { name: 'rpi4.md' },
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
      value: '/dev/mmcblk1' as unknown as Record<string, any>,
    }],
  },
});
