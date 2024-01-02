import * as pulumi from '@pulumi/pulumi';
import * as infra from '@unstoppablemango/thecluster-crds/infrastructure/v1alpha3';
import * as serverClasses from '../serverClasses';
import ns from '../namespace';

export default new infra.MetalMachineTemplate('ryzen.gen1.md', {
  metadata: {
    name: 'ryzen.gen1.md',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        serverClassRef: {
          apiVersion: serverClasses.ryzenGen1Md.apiVersion.apply(x => x ?? ''),
          kind: serverClasses.ryzenGen1Md.kind.apply(x => x ?? ''),
          name: pulumi.output(serverClasses.ryzenGen1Md.metadata).apply(x => x?.name ?? ''),
        },
      },
    },
  },
});
