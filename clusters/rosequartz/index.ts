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

if (config.requireBoolean('createDnsRecord')) {
  const zoneId = '22f1d42ba0fbe4f924905e1c6597055c';
  const publicIp = config.require('publicIp');
  const dnsName = config.require('primaryDnsName');

  certSans.push(publicIp);

  const primaryDns = new cloudflare.Record('primary-dns', {
    name: dnsName,
    zoneId: zoneId,
    type: 'A',
    value: publicIp,
    proxied: false,
  }, { protect: true });

  const ssl = new cloudflare.Ruleset('ssl', {
    name: `${dnsName} SSL`,
    description: `Set SSL to a value that works for ${dnsName}`,
    kind: 'zone',
    zoneId: zoneId,
    phase: 'http_config_settings',
    rules: [{
      action: 'set_config',
      actionParameters: {
        ssl: 'full',
      },
      expression: `(http.host eq "${dnsName}") or (http.host eq "pd.thecluster.io")`,
    }],
  })
}

const clusterName = config.require('clusterName');
const endpoint = config.require('endpoint');
const vip = config.require('vip');

certSans.push(endpoint, vip);

const clusterEndpoint = `https://${vip}:6443`;
const nodeData = config.requireObject<Cluster>('nodeData');
const versions = config.requireObject<Versions>('versions');

const allNodeData: Nodes = { ...nodeData.controlplanes, ...nodeData.workers };

const secrets = new talos.machine.Secrets('secrets', { talosVersion: `v${versions.talos}` });

export const secretData = secrets.clientConfiguration;

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
  endpoints: [endpoint],
  nodes: Object.keys(allNodeData),
});

const bootstrap: talos.machine.Bootstrap[] = Object.keys(allNodeData)
  .map((key, i) => (new talos.machine.Bootstrap(`bootstrap-${i}`, {
    clientConfiguration: secrets.clientConfiguration,
    node: key,
    endpoint: endpoint,
  })));

const controlplaneConfigApply: talos.machine.ConfigurationApply[] = Object.entries(nodeData.controlplanes || [])
  .map(([key, value]) => (new talos.machine.ConfigurationApply(`controlplane-${key}`, {
    applyMode: 'no_reboot',
    clientConfiguration: secrets.clientConfiguration,
    machineConfigurationInput: controlplaneConfig.machineConfiguration,
    endpoint: endpoint,
    node: key,
    configPatches: [YAML.stringify({
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
        network: {
          interfaces: [{
            deviceSelector: { busPath: '0*' },
            dhcp: true,
            vip: { ip: vip },
          }],
        },
        certSANs: certSans,
        kubelet: {
          extraArgs: {
            'rotate-server-certificates': true,
          },
        },
      }
    })],
  }, { dependsOn: bootstrap })));

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
export const kubeconfig = kubeconfigOutput.kubeconfigRaw;
