import * as pulumi from '@pulumi/pulumi';
import * as infra from '@pulumi/crds/infrastructure/v1beta1';
import ns from '../namespace';
import { Versions } from '../types';

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');

export default new infra.ProxmoxMachineTemplate('px.apollo.md', {
  metadata: {
    name: 'px.apollo.md',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        options: {
          onBoot: true,
        },
        image: {
          url: `https://github.com/siderolabs/talos/releases/download/v${versions.talos}/metal-amd64.iso`,
        },
        node: 'apollo',
        hardware: {
          cpu: 8,
          memory: 8192,
          disk: '100Gb',
        },
        storage: 'spool',
      },
    },
  },
});
