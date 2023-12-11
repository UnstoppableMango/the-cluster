import * as pulumi from '@pulumi/pulumi';
import * as metal from '@unmango/thecluster-crds/metal/v1alpha2';
import * as env from '../environments';

export default new metal.ServerClass('rpi4.md', {
  metadata: { name: 'rpi4.md' },
  spec: {
    environmentRef: {
      apiVersion: env.rpi.apiVersion.apply(x => x ?? ''),
      name: pulumi.output(env.rpi.metadata).apply(x => x?.name ?? ''),
    },
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
    configPatches: [
      {
        op: 'replace',
        path: '/machine/install/diskSelector',
        value: {
          type: 'SD',
        },
      },
      {
        op: 'add',
        path: '/machine/sysctls',
        value: {
          'kernel.kexec_load_disabled': 1,
        },
      },
    ],
  },
});
