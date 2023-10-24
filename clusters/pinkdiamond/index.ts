import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import * as cluster from '@pulumi/crds/cluster/v1beta1';
import * as infra from '@pulumi/crds/infrastructure';
import * as metal from '@pulumi/crds/metal/v1alpha2';

const clusterApiStack = new pulumi.StackReference('clusterapi', {
  name: 'UnstoppableMango/thecluster-clusterapi/rosequartz',
});

const config = new pulumi.Config();

// TODO: Tunnel
const publicEndpoint = new cloudflare.Record('pd.thecluster.io', {
  name: 'pd.thecluster.io',
  type: 'A',
  zoneId: config.require('zoneId'),
  proxied: false,
  value: config.requireSecret('publicIp'),
});

const ns = new k8s.core.v1.Namespace('pink-diamond', {
  metadata: { name: 'pink-diamond' },
});

const manifests = new k8s.kustomize.Directory('manifests', {
  directory: './manifests',
}, {
  dependsOn: [publicEndpoint, ns],
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});

const rpi4ServerClass = metal.ServerClass.get(
  'ryzenGen1MdServerClass',
  clusterApiStack.getOutput('ryzenGen1MdServerClassId'));

const ryzenWorkers = new infra.v1alpha3.MetalMachineTemplate('ryzen', {
  metadata: {
    name: 'pink-diamond-ryzen-workers',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        serverClassRef: {
          apiVersion: rpi4ServerClass.apiVersion.apply(x => x ?? ''),
          kind: rpi4ServerClass.kind.apply(x => x ?? ''),
          name: pulumi.output(rpi4ServerClass.metadata).apply(x => x?.name ?? ''),
        },
      },
    },
  },
});

const ryzenMachineDeployment = new cluster.MachineDeployment('pink-diamond-ryzen-workers', {
  metadata: {
    name: 'pink-diamond-ryzen-workers',
    namespace: ns.metadata.name,
  },
  spec: {
    clusterName: 'pink-diamond',
    replicas: 1,
    selector: {},
    template: {
      spec: {
        clusterName: 'pink-diamond',
        version: `v${config.require('k8sVersion')}`,
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1alpha3',
            kind: 'TalosConfigTemplate',
            name: 'pink-diamond-workers',
          },
        },
        infrastructureRef: {
          apiVersion: ryzenWorkers.apiVersion.apply(x => x ?? ''),
          kind: ryzenWorkers.kind.apply(x => x ?? ''),
          name: pulumi.output(ryzenWorkers.metadata).apply(x => x?.name ?? ''),
        },
      },
    },
  },
});
