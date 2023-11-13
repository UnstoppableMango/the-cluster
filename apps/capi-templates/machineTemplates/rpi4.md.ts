import * as pulumi from '@pulumi/pulumi';
import * as infra from '@pulumi/crds/infrastructure/v1alpha3';
import * as serverClasses from '../serverClasses';
import ns from '../namespace';

export default new infra.MetalMachineTemplate('rpi4.md', {
  metadata: {
    name: 'rpi4.md',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        serverClassRef: {
          apiVersion: serverClasses.rpi4Md.apiVersion.apply(x => x ?? ''),
          kind: serverClasses.rpi4Md.kind.apply(x => x ?? ''),
          name: pulumi.output(serverClasses.rpi4Md.metadata).apply(x => x?.name ?? ''),
        },
      },
    },
  },
});
