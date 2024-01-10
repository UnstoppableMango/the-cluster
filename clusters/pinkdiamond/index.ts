import * as pulumi from '@pulumi/pulumi';
import * as cloudflare from '@pulumi/cloudflare';
import * as talos from '@pulumiverse/talos';
import * as YAML from 'yaml';
import { Node, Versions } from './types';

const config = new pulumi.Config();
const controlPlanes = config.requireObject<Node[]>('controlplanes');
const workers = config.requireObject<Node[]>('workers');
export const certSans = config.requireObject<string[]>('certSans');
export const versions = config.requireObject<Versions>('versions');

if (config.getBoolean('public') ?? false) {
  const zoneId = '22f1d42ba0fbe4f924905e1c6597055c';
  const publicIp = config.require('publicIp');
  const dnsName = config.require('primaryDnsName');

  certSans.push(publicIp, dnsName);

  const primaryDns = new cloudflare.Record('primary-dns', {
    name: dnsName,
    zoneId: zoneId,
    type: 'A',
    value: publicIp,
    proxied: false,
  });
}

export const clusterName = config.require('clusterName');
export const endpoint = config.require('endpoint');
certSans.push(endpoint);

export const vip = config.get('vip');
if (vip) certSans.push(vip);

export const clusterEndpoint = config.require('clusterEndpoint');
const controlplanePatches: string[] = [];

if (vip) {
  controlplanePatches.push(YAML.stringify({
    machine: {
      network: {
        interfaces: [{
          deviceSelector: { hardwareAddr: 'd8:3a:dd:*' },
          dhcp: true,
          vip: { ip: vip },
        }],
      },
    },
  }));
}

const secrets = new talos.machine.Secrets('secrets', { talosVersion: `v${versions.talos}` });

const controlplaneConfig = talos.machine.getConfigurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'controlplane',
  machineSecrets: secrets.machineSecrets,
  docs: false,
  examples: false,
  talosVersion: `v${versions.talos}`,
  kubernetesVersion: versions.k8s,
  configPatches: [
    ...controlplanePatches,
    YAML.stringify({
      cluster: {
        apiServer: {
          certSANs: certSans,
          extraArgs: {
            'oidc-issuer-url': 'https://keycloak.thecluster.io/realms/external',
            'oidc-client-id': 'dex',
          },
          disablePodSecurityPolicy: true, // So we can exempt things
          admissionControl: [{
            // https://www.talos.dev/v1.5/reference/configuration/#apiserverconfig
            name: 'PodSecurity',
            configuration: {
              apiVersion: 'pod-security.admission.config.k8s.io/v1alpha1',
              kind: 'PodSecurityConfiguration',
              defaults: {
                audit: 'restricted',
                'audit-version': 'latest',
                enforce: 'baseline',
                'enforce-version': 'latest',
                warn: 'restricted',
                'warn-version': 'latest',
              },
              exemptions: {
                namespaces: [
                  'ceph-system',
                  'kube-vip',
                  'qemu-guest-agent',
                  'internal-ingress',
                  'drone',
                  'cert-manager',
                ],
              },
            },
          }],
        },
      },
      machine: {
        install: {
          image: `ghcr.io/siderolabs/installer:v${versions.talos}`,
        },
        certSANs: certSans,
        kubelet: {
          extraArgs: {
            'rotate-server-certificates': true,
          },
        },
        features: {
          kubernetesTalosAPIAccess: {
            enabled: true,
            allowedRoles: ['os:admin'],
            allowedKubernetesNamespaces: [
              'kube-system',
              'qemu-guest-agent',
            ],
          },
        },
      },
    }),
  ],
});

const workerConfig = talos.machine.getConfigurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'worker',
  machineSecrets: secrets.machineSecrets,
  docs: false,
  examples: false,
  talosVersion: `v${versions.talos}`,
  kubernetesVersion: versions.k8s,
  configPatches: [
    YAML.stringify({
      machine: {
        install: {
          image: `ghcr.io/siderolabs/installer:v${versions.talos}`,
        },
        certSANs: certSans,
        kubelet: {
          extraArgs: {
            'rotate-server-certificates': true,
          },
        },
      },
    }),
  ],
});

const clientConfig = talos.client.getConfigurationOutput({
  clusterName: clusterName,
  clientConfiguration: secrets.clientConfiguration,
  endpoints: controlPlanes.map(x => x.ip),
  nodes: [controlPlanes[0].ip],
});

const controlPlaneConfigApply: talos.machine.ConfigurationApply[] = controlPlanes
  .map(x => (new talos.machine.ConfigurationApply(x.ip, {
    clientConfiguration: secrets.clientConfiguration,
    machineConfigurationInput: controlplaneConfig.machineConfiguration,
    node: x.ip,
    configPatches: [
      YAML.stringify({
        cluster: {
          extraManifests: [
            `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${versions.ksca}/deploy/ha-install.yaml`,
          ],
        },
        machine: {
          install: {
            disk: x.installDisk,
          },
        },
      }),
    ],
  })));

const workerConfigApply: talos.machine.ConfigurationApply[] = workers
  .map(x => {
    const patches = [YAML.stringify({
      machine: {
        install: {
          disk: x.installDisk,
        },
      },
    })];

    if (x.qemu) patches.push(YAML.stringify({
      machine: {
        nodeLabels: {
          'thecluster.io/qemu-agent': true,
        },
      },
    }));

    return new talos.machine.ConfigurationApply(x.ip, {
      clientConfiguration: secrets.clientConfiguration,
      machineConfigurationInput: workerConfig.machineConfiguration,
      node: x.ip,
      configPatches: patches,
    });
  });

const bootstrap = new talos.machine.Bootstrap(`bootstrap`, {
  clientConfiguration: secrets.clientConfiguration,
  node: endpoint,
  endpoint: endpoint,
}, {
  dependsOn: [
    ...controlPlaneConfigApply,
    ...workerConfigApply,
  ]
});

const kubeconfigOutput = talos.cluster.getKubeconfigOutput({
  clientConfiguration: secrets.clientConfiguration,
  node: controlPlanes[0].ip,
  endpoint: endpoint,
  timeouts: {
    read: config.require('kubeconfigTimeout'),
  },
});

talos.cluster.getHealthOutput({
  clientConfiguration: secrets.clientConfiguration,
  controlPlaneNodes: controlPlanes.map(x => x.ip),
  workerNodes: workers.map(x => x.ip),
  endpoints: controlPlanes.map(x => x.ip),
  timeouts: {
    read: config.require('healthTimeout'),
  },
});

export const talosconfig = clientConfig.talosConfig;
export const kubeconfig = kubeconfigOutput.kubeconfigRaw.apply(setPublicEndpoint);
export const kubernetesClientConfig = kubeconfigOutput.kubernetesClientConfiguration;

function setPublicEndpoint(kubeconfig: string): string {
  if (!config.getBoolean('public')) return kubeconfig;
  const kc = YAML.parse(kubeconfig);
  kc.clusters[0].cluster.server = `https://${config.require('primaryDnsName')}:6444`;
  return YAML.stringify(kc);
}
