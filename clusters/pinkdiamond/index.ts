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

const ns = new k8s.core.v1.Namespace('pinkdiamond', {
  metadata: { name: 'pinkdiamond' },
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

// --------------------------------------------------------------
// Copied from `rosequartz/index.ts` on the `split-capi` branch
// --------------------------------------------------------------
//
// import * as pulumi from "@pulumi/pulumi";
// import * as cloudflare from "@pulumi/cloudflare";
// import * as k8s from '@pulumi/kubernetes';
// import * as cluster from '@pulumi/crds/cluster/v1beta1';
// import * as infra from '@pulumi/crds/infrastructure/v1alpha3';
// import * as controlPlane from '@pulumi/crds/controlplane/v1alpha3';
// import * as serverClasses from './serverClasses';
// import { ControlPlaneConfig, Versions } from './types';

// const config = new pulumi.Config();

// const zoneId = "22f1d42ba0fbe4f924905e1c6597055c";

// if (config.requireBoolean('createDnsRecord')) {
//   const dnsName = config.require('primaryDnsName');

//   const primaryDns = new cloudflare.Record('primary-dns', {
//     name: dnsName,
//     zoneId: zoneId,
//     type: "A",
//     value: config.require("publicIp"),
//     proxied: false,
//   }, { protect: true });

//   const ssl = new cloudflare.Ruleset('ssl', {
//     name: `${dnsName} SSL`,
//     description: `Set SSL to a value that works for ${dnsName}`,
//     kind: "zone",
//     zoneId: zoneId,
//     phase: "http_config_settings",
//     rules: [{
//       action: "set_config",
//       actionParameters: {
//         ssl: "full",
//       },
//       expression: `(http.host eq "${dnsName}") or (http.host eq "pd.thecluster.io")`,
//     }],
//   })
// }

// const controlPlaneConfig = config.requireObject<ControlPlaneConfig>('controlPlane');

// // Subject Alternative Names to use for certificates
// const certSans = [
//   // // The first in the array seems to get ignored for some reason, so we add it twice
//   // config.require('localIp'),
//   config.require('localIp'),
//   config.require('primaryDnsName'),
//   config.require('vip'),
// ];

// const versions = config.requireObject<Versions>('versions');

// const ns = new k8s.core.v1.Namespace('rosequartz', {
//   metadata: { name: 'rosequartz' },
// });

// const metalCluster = new infra.MetalCluster('rosequartz', {
//   metadata: {
//     name: 'rosequartz',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     controlPlaneEndpoint: {
//       host: controlPlaneConfig.endpoint,
//       port: controlPlaneConfig.port,
//     },
//   },
// });

// const controlPlaneTemplate = new infra.MetalMachineTemplate('rosequartz', {
//   metadata: {
//     name: 'rosequartz',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     template: {
//       spec: {
//         serverClassRef: {
//           apiVersion: serverClasses.rosequartz.apiVersion.apply(x => x ?? ''),
//           kind: serverClasses.rosequartz.kind.apply(x => x ?? ''),
//           name: pulumi.output(serverClasses.rosequartz.metadata).apply(x => x?.name ?? ''),
//         },
//       },
//     },
//   },
// });

// const talosControlPlane = new controlPlane.TalosControlPlane('rosequartz', {
//   metadata: {
//     name: 'rosequartz',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     version: `v${versions.k8s}`,
//     replicas: controlPlaneConfig.machineCount,
//     controlPlaneConfig: {
//       controlplane: {
//         generateType: 'controlplane',
//         talosVersion: `v${versions.talos}`,
//         configPatches: [{
//           op: 'replace',
//           path: '/cluster/allowSchedulingOnControlPlanes',
//           value: true as unknown as Record<string, any>,
//         }, {
//           op: 'replace',
//           path: '/cluster/extraManifests',
//           value: [
//             `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${versions.ksca}/deploy/standalone-install.yaml`,
//           ],
//         }, {
//           op: 'replace',
//           path: '/cluster/apiServer/certSANs',
//           value: certSans,
//         }, {
//           op: 'replace',
//           path: '/machine/certSANs',
//           value: certSans,
//         }, {
//           op: 'add',
//           path: '/machine/kubelet/extraArgs',
//           value: {
//             'rotate-server-certificates': true,
//           },
//         }, {
//           op: 'add',
//           path: '/machine/network',
//           value: {
//             interfaces: [{
//               deviceSelector: {
//                 hardwareAddr: 'd8:3a:dd:*',
//               },
//               dhcp: true,
//               vip: {
//                 ip: config.require('vip'),
//               },
//             }],
//           },
//         }],
//       },
//     },
//     infrastructureTemplate: {
//       apiVersion: controlPlaneTemplate.apiVersion.apply(x => x ?? ''),
//       kind: controlPlaneTemplate.kind.apply(x => x ?? ''),
//       name: pulumi.output(controlPlaneTemplate.metadata).apply(x => x?.name ?? ''),
//     },
//   },
// });

// const rosequartzCluster = new cluster.Cluster('rosequartz', {
//   metadata: {
//     name: config.require('clusterName'),
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     clusterNetwork: {
//       pods: {
//         cidrBlocks: ['10.244.0.0/16'],
//       },
//       services: {
//         cidrBlocks: ['10.96.0.0/12'],
//       },
//     },
//     controlPlaneRef: {
//       apiVersion: talosControlPlane.apiVersion.apply(x => x ?? ''),
//       kind: talosControlPlane.kind.apply(x => x ?? ''),
//       name: pulumi.output(talosControlPlane.metadata).apply(x => x?.name ?? ''),
//     },
//     infrastructureRef: {
//       apiVersion: metalCluster.apiVersion.apply(x => x ?? ''),
//       kind: metalCluster.kind.apply(x => x ?? ''),
//       name: pulumi.output(metalCluster.metadata).apply(x => x?.name ?? ''),
//     },
//   },
// });

// export const serverClassId = serverClasses.rosequartz.id;

// // const machineDeployment = new cluster.MachineDeployment('rosequartz', {
// //   metadata: {
// //     name: 'rosequartz',
// //     namespace: ns.metadata.name,
// //   },
// //   spec: {
// //     clusterName: config.require('clusterName'),
// //   },
// // });
