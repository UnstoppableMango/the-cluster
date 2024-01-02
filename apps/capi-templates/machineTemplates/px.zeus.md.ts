import * as pulumi from '@pulumi/pulumi';
import * as infra from '@unstoppablemango/thecluster-crds/infrastructure/v1beta1';
import ns from '../namespace';
import { Versions } from '../types';

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');

export default new infra.ProxmoxMachineTemplate('px.zeus.md', {
  metadata: {
    name: 'px.zeus.md',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        image: {
          url: `https://github.com/siderolabs/talos/releases/download/v${versions.talos}/metal-amd64.iso`,
        },
        node: 'zeus',
        hardware: {
          cpu: 8,
          memory: 8192,
        },
        storage: 'spool',
      },
    },
  },
});
