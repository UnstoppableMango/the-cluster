import * as metal from '@pulumi/crds/metal/v1alpha2';

export default new metal.ServerClass('ryzen.gen1.md', {
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
});
