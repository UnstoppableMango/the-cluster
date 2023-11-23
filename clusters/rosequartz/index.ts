import * as pulumi from '@pulumi/pulumi';
import * as cloudflare from '@pulumi/cloudflare';
import * as talos from '@pulumiverse/talos';
import * as YAML from 'yaml';

type Nodes = Record<string, {
  hostname?: string,
  installDisk?: string
}>;

interface Cluster {
  controlplanes?: Nodes,
  workers?: Nodes,
}

interface Versions {
  k8s: string,
  talos: string,
  ksca: string,
}

const config = new pulumi.Config();
const certSans = config.requireObject<string[]>('certSans');

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

const clusterName = config.require('clusterName');
const endpoint = config.require('endpoint');
certSans.push(endpoint);

const vip = config.get('vip');
if (vip) certSans.push(vip);

const clusterEndpoint = config.require('clusterEndpoint');
const nodeData = config.requireObject<Cluster>('nodeData');
const versions = config.requireObject<Versions>('versions');

const allNodeData: Nodes = { ...nodeData.controlplanes, ...nodeData.workers };

const secrets = new talos.machine.Secrets('secrets', { talosVersion: `v${versions.talos}` });

const controlplaneConfig = talos.machine.configurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'controlplane',
  machineSecrets: secrets.machineSecrets,
  docs: false,
  examples: false,
  talosVersion: `v${versions.talos}`,
  kubernetesVersion: versions.k8s,
});

const clientConfig = talos.client.configurationOutput({
  clusterName: clusterName,
  clientConfiguration: secrets.clientConfiguration,
  endpoints: Object.keys(allNodeData),
  nodes: Object.keys(allNodeData),
});

const configPatches: string[] = [];

if (vip) {
  configPatches.push(YAML.stringify({
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

const controlplaneConfigApply: talos.machine.ConfigurationApply[] = Object.entries(nodeData.controlplanes || [])
  .map(([key, value]) => (new talos.machine.ConfigurationApply(`controlplane-${key}`, {
    clientConfiguration: secrets.clientConfiguration,
    machineConfigurationInput: controlplaneConfig.machineConfiguration,
    node: key,
    configPatches: [
      ...configPatches,
      YAML.stringify({
        cluster: {
          allowSchedulingOnControlPlanes: true,
          apiServer: {
            certSANs: certSans,
          },
          extraManifests: [
            `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${versions.ksca}/deploy/standalone-install.yaml`,
          ],
        },
        machine: {
          install: {
            disk: value.installDisk,
            image: `ghcr.io/siderolabs/installer:v${versions.talos}`,
          },
          certSANs: certSans,
          kubelet: {
            extraArgs: {
              'rotate-server-certificates': true,
            },
          },
        }
      }),
    ],
  })));

const bootstrap = new talos.machine.Bootstrap(`bootstrap`, {
  clientConfiguration: secrets.clientConfiguration,
  node: endpoint,
  endpoint: endpoint,
}, { dependsOn: controlplaneConfigApply });

// const healthCheck = talos.cluster.healthOutput({
//     clientConfiguration: secrets.clientConfiguration,
//     controlPlaneNodes: Object.keys(nodeData.controlplanes ?? []),
//     endpoints: [endpoint],
//     timeouts: {
//         read: config.require('healthTimeout'),
//     },
// });

const kubeconfigOutput = talos.cluster.kubeconfigOutput({
  clientConfiguration: secrets.clientConfiguration,
  node: Object.keys(nodeData.controlplanes ?? [])[0],
  endpoint: endpoint,
  timeouts: {
    read: config.require('kubeconfigTimeout'),
  },
});

export const talosconfig = clientConfig.talosConfig;
export const kubeconfig = kubeconfigOutput.kubeconfigRaw.apply(setPublicEndpoint);
export const kubernetesClientConfig = kubeconfigOutput.kubernetesClientConfiguration;

function setPublicEndpoint(kubeconfig: string): string {
  if (!config.getBoolean('public')) return kubeconfig;
  const kc = YAML.parse(kubeconfig);
  kc.clusters[0].cluster.server = `https://${config.require('primaryDnsName')}:6443`;
  return YAML.stringify(kc);
}
