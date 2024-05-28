import * as YAML from 'yaml';
import { ClusterPki } from '@unmango/pulumi-kubernetes-the-hard-way/tls';
import { EtcdCluster } from '@unmango/pulumi-kubernetes-the-hard-way/remote';
import { Node, Versions, config, stack } from './config';

const key = config.requireSecret('nodeKey');

const pki = new ClusterPki('pinkdiamond', {
  clusterName: 'pinkdiamond',
  nodes: {
    pik8s4: {
      ip: '192.168.1.104',
      role: 'controlplane',
    },
    pik8s5: {
      ip: '192.168.1.105',
      role: 'controlplane',
    },
    pik8s6: {
      ip: '192.168.1.106',
      role: 'controlplane',
    },
  },
  publicIp: '192.168.1.100',
});

const etcd = new EtcdCluster('pinkdiamond', {
  bundle: {
    caPem: pki.kubernetes.caCertPem,
    certPem: pki.kubernetes.certPem,
    keyPem: pki.kubernetes.privateKeyPem,
  },
  nodes: {
    pik8s4: {
      connection: {
        host: '192.168.1.104',
        user: 'root',
        privateKey: key,
      },
      internalIp: '192.168.1.104',
      architecture: 'arm64',
    },
    pik8s5: {
      connection: {
        host: '192.168.1.105',
        user: 'root',
        privateKey: key,
      },
      internalIp: '192.168.1.105',
      architecture: 'arm64',
    },
    pik8s6: {
      connection: {
        host: '192.168.1.106',
        user: 'root',
        privateKey: key,
      },
      internalIp: '192.168.1.106',
      architecture: 'arm64',
    },
  },
  architecture: 'arm64',
});

export const caPem = pki.ca.certPem;
export const etcdCert = pki.kubernetes.certPem;
export const etcdKey = pki.kubernetes.privateKeyPem;

export const kubeconfig = pki.getKubeconfig({
  options: {
    publicIp: '192.168.1.100',
    type: 'admin',
  },
}).apply(YAML.stringify);

// const controlPlanes = config.requireObject<Node[]>('controlplanes');
// const workers = config.requireObject<Node[]>('workers');
// export const certSans = config.requireObject<string[]>('certSans');
// export const versions = config.requireObject<Versions>('versions');
// export const clusterName = config.require('clusterName');
// export const endpoint = config.require('endpoint');
// export const vip = config.get('vip');
// export const clusterEndpoint = config.require('clusterEndpoint');

// const secrets = new talos.machine.Secrets('secrets');

// const controlplaneConfig = talos.machine.getConfigurationOutput({
//   clusterName: clusterName,
//   clusterEndpoint: clusterEndpoint,
//   machineType: 'controlplane',
//   docs: false,
//   examples: false,
//   kubernetesVersion: versions.k8s,
//   machineSecrets: secrets.machineSecrets,
//   configPatches: [jsonStringify({
//     cluster: {
//       apiServer: {
//         certSANs: certSans,
//         extraArgs: {
//           'oidc-issuer-url': 'https://keycloak.thecluster.io/realms/external',
//           'oidc-client-id': 'dex',
//         },
//         disablePodSecurityPolicy: true, // So we can exempt things
//         admissionControl: [{
//           // https://www.talos.dev/v1.5/reference/configuration/#apiserverconfig
//           name: 'PodSecurity',
//           configuration: {
//             apiVersion: 'pod-security.admission.config.k8s.io/v1alpha1',
//             kind: 'PodSecurityConfiguration',
//             defaults: {
//               'audit': 'restricted',
//               'audit-version': 'latest',
//               'enforce': 'baseline',
//               'enforce-version': 'latest',
//               'warn': 'restricted',
//               'warn-version': 'latest',
//             },
//             exemptions: {
//               namespaces: [
//                 'ceph-system',
//                 'kube-vip',
//                 'internal-ingress',
//                 'drone',
//                 'cert-manager',
//                 'zfs-localpv',
//               ],
//             },
//           },
//         }],
//       },
//     },
//     machine: {
//       certSANs: certSans,
//       kubelet: {
//         extraArgs: {
//           'rotate-server-certificates': true,
//         },
//       },
//       features: {
//         kubernetesTalosAPIAccess: {
//           enabled: true,
//           allowedRoles: ['os:admin'],
//           allowedKubernetesNamespaces: [
//             'kube-system',
//           ],
//         },
//       },
//       files: [
//         {
//           content: caPem,
//           path: '/etc/ssl/certs/ca-certificates',
//           permissions: 644,
//           op: 'append',
//         },
//         {
//           content: certs.cloudflare.cert.certificate,
//           path: '/etc/ssl/certs/ca-certificates',
//           permissions: 644,
//           op: 'append',
//         },
//       ],
//     },
//   })],
// });

// const workerConfig = talos.machine.getConfigurationOutput({
//   clusterName: clusterName,
//   clusterEndpoint: clusterEndpoint,
//   machineType: 'worker',
//   docs: false,
//   examples: false,
//   kubernetesVersion: versions.k8s,
//   machineSecrets: secrets.machineSecrets,
//   configPatches: [jsonStringify({
//     machine: {
//       install: {
//         image: `ghcr.io/siderolabs/installer:v${versions.talos}`,
//       },
//       certSANs: certSans,
//       kubelet: {
//         extraArgs: {
//           'rotate-server-certificates': true,
//         },
//       },
//       files: [
//         {
//           content: caPem,
//           path: '/etc/ssl/certs/ca-certificates',
//           permissions: 644,
//           op: 'append',
//         },
//         {
//           content: certs.cloudflare.cert.certificate,
//           path: '/etc/ssl/certs/ca-certificates',
//           permissions: 644,
//           op: 'append',
//         },
//       ],
//     },
//   })],
// });

// const clientConfig = talos.client.getConfigurationOutput({
//   clusterName: clusterName,
//   clientConfiguration: secrets.clientConfiguration,
//   endpoints: controlPlanes.map(x => x.ip),
//   nodes: [controlPlanes[0].ip],
// });

// const configPatches: string[] = [];

// if (stack === 'prod') {
//   configPatches.push(YAML.stringify({
//     machine: {
//       network: {
//         interfaces: [{
//           deviceSelector: { hardwareAddr: 'd8:3a:dd:*' },
//           dhcp: true,
//           vip: { ip: vip },
//         }],
//       },
//     },
//   }));
// }

// const controlPlaneConfigApply: talos.machine.ConfigurationApply[] = controlPlanes
//   .map(x => new talos.machine.ConfigurationApply(x.ip, {
//     clientConfiguration: secrets.clientConfiguration,
//     machineConfigurationInput: controlplaneConfig.machineConfiguration,
//     node: x.ip,
//     configPatches: [
//       ...configPatches,
//       jsonStringify({
//         cluster: {
//           extraManifests: [
//             `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${versions.ksca}/deploy/ha-install.yaml`,
//           ],
//         },
//         machine: {
//           install: {
//             image: `factory.talos.dev/installer/${x.schematicId}:v${versions.talos}`,
//             disk: x.installDisk,
//           },
//           nodeTaints: x.nodeTaints,
//         },
//       }),
//     ],
//   }));

// const workerConfigApply: talos.machine.ConfigurationApply[] = workers
//   .map(x => new talos.machine.ConfigurationApply(x.ip, {
//     clientConfiguration: secrets.clientConfiguration,
//     machineConfigurationInput: workerConfig.machineConfiguration,
//     node: x.ip,
//     configPatches: [jsonStringify({
//       machine: {
//         install: {
//           image: `factory.talos.dev/installer/${x.schematicId}:v${versions.talos}`,
//           disk: x.installDisk,
//           wipe: x.wipe,
//           extensions: x.extensions,
//         },
//         nodeLabels: x.nodeLabels,
//         nodeTaints: x.nodeTaints,
//       },
//     })],
//   }));

// const bootstrap = new talos.machine.Bootstrap('bootstrap', {
//   clientConfiguration: secrets.clientConfiguration,
//   node: endpoint,
//   endpoint: endpoint,
// }, {
//   dependsOn: [
//     ...controlPlaneConfigApply,
//     ...workerConfigApply,
//   ],
// });

// const kubeconfigOutput = talos.cluster.getKubeconfigOutput({
//   clientConfiguration: secrets.clientConfiguration,
//   node: controlPlanes[0].ip,
//   endpoint: endpoint,
//   timeouts: {
//     read: config.require('kubeconfigTimeout'),
//   },
// });

// // talos.cluster.getHealthOutput({
// //   clientConfiguration: secrets.clientConfiguration,
// //   controlPlaneNodes: controlPlanes.map(x => x.ip),
// //   workerNodes: workers.map(x => x.ip),
// //   endpoints: controlPlanes.map(x => x.ip),
// //   timeouts: {
// //     read: config.require('healthTimeout'),
// //   },
// // });

// export const talosconfig = clientConfig.talosConfig;
// export const kubeconfig = kubeconfigOutput.kubeconfigRaw;
// export const kubernetesClientConfig = kubeconfigOutput.kubernetesClientConfiguration;
