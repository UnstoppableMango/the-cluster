import * as pulumi from '@pulumi/pulumi';
import * as metal from '@pulumi/crds/metal/v1alpha2';
import * as env from '../environments';

export default new metal.ServerClass('rosequartz', {
  metadata: { name: 'rosequartz' },
  spec: {
    environmentRef: {
      apiVersion: env.rpi.apiVersion.apply(x => x ?? ''),
      name: pulumi.output(env.rpi.metadata).apply(x => x?.name ?? ''),
      namespace: 'default',
    },
    qualifiers: {
      hardware: [{
        system: {
          family: 'Raspberry Pi',
          serialNumber: '0000D83ADD424101',
        },
      }],
    },
    bootFromDiskMethod: 'ipxe-sanboot',
    configPatches: [{
      op: 'replace',
      path: '/machine/install/diskSelector',
      value: {
        type: 'SD',
      },
    }, {
      op: 'add',
      path: '/machine/sysctls',
      value: {
        'kernel.kexec_load_disabled': 1,
      },
    }],
  },
});
