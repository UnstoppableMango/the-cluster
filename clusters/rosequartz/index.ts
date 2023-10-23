import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import * as talos from "@pulumiverse/talos";
import * as fs from 'fs';
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
  'kubernetes/kubernetes': string,
  'siderolabs/talos': string,
  'alex1989hu/kubelet-server-cert-approver': string,
}

const config = new pulumi.Config();

// A name to provide for the Talos cluster
const clusterName = config.require("clusterName");

// The public IP used for the Talos cluster
const publicIp = config.require("publicIp");

const endpoint = config.get("primaryDnsName") ?? publicIp;
const clusterEndpoint = `https://${endpoint}:6443`;

// Subject Alternative Names to use for certificates
const certSans = config.requireObject<string[]>("certSans").concat([
  publicIp,
  endpoint,
]);

// A map of node data
const nodeData = config.requireObject<Cluster>("nodeData");

// Timeout for the health operation
const healthTimeout = config.require("healthTimeout");

// Timeout for the kubeconfig operation
const kubeconfigTimeout = config.require("kubeconfigTimeout");

const versions: Versions = YAML.parse(fs.readFileSync('.versions', { encoding: 'utf-8' }));
const k8sVersion = versions['kubernetes/kubernetes'];
const talosVersion = versions['siderolabs/talos'];
const kscaVersion = versions['alex1989hu/kubelet-server-cert-approver'];

const installerImage = `ghcr.io/siderolabs/installer:v${talosVersion}`;

const allNodeData: Nodes = { ...nodeData.controlplanes, ...nodeData.workers };
const zoneId = "22f1d42ba0fbe4f924905e1c6597055c";

if (pulumi.getStack() === 'prod') {
  const dnsName = config.require('primaryDnsName');

  const primaryDns = new cloudflare.Record('primary-dns', {
    name: dnsName,
    zoneId: zoneId,
    type: "A",
    value: publicIp,
    proxied: false,
  });

  const ssl = new cloudflare.Ruleset('ssl', {
    name: `${dnsName} SSL`,
    description: `Set SSL to a value that works for ${dnsName}`,
    kind: "zone",
    zoneId: zoneId,
    phase: "http_config_settings",
    rules: [{
      action: "set_config",
      actionParameters: {
        ssl: "full",
      },
      expression: `(http.host eq "${dnsName}") or (http.host eq "pd.thecluster.io")`,
    }],
  })
}

const secrets = new talos.machine.Secrets('secrets', { talosVersion: `v${talosVersion}` });

const controlplaneConfig = talos.machine.configurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: "controlplane",
  machineSecrets: secrets.machineSecrets,
  docs: false,
  examples: false,
  talosVersion: `v${talosVersion}`,
  kubernetesVersion: k8sVersion,
});

const clientConfig = talos.client.configurationOutput({
  clusterName: clusterName,
  clientConfiguration: secrets.clientConfiguration,
  endpoints: [endpoint],
  nodes: Object.keys(allNodeData),
});

const controlplaneConfigApply: talos.machine.ConfigurationApply[] = Object.entries(nodeData.controlplanes || [])
  .map(([key, value]) => (new talos.machine.ConfigurationApply(`controlplane-${key}`, {
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
          `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${kscaVersion}/deploy/standalone-install.yaml`,
        ],
      },
      machine: {
        install: {
          disk: value.installDisk,
          image: installerImage,
        },
        network: {
          hostname: value.hostname,
        },
        certSANs: certSans,
        kubelet: {
          extraArgs: {
            'rotate-server-certificates': true,
          },
        },
      }
    })],
  })))

const bootstrap: talos.machine.Bootstrap[] = Object.keys(allNodeData)
  .map((key, i) => (new talos.machine.Bootstrap(`bootstrap-${i}`, {
    clientConfiguration: secrets.clientConfiguration,
    node: key,
    endpoint: endpoint,
  })));

// const healthCheck = talos.index.clusterHealth({
//     clientConfiguration: thisResource.clientConfiguration,
//     controlPlaneNodes: Object.keys(nodeData.controlplanes ?? []),
//     endpoints: [endpoint],
//     timeouts: {
//         read: healthTimeout,
//     },
// });

const kubeconfigOutput = talos.cluster.kubeconfigOutput({
  clientConfiguration: secrets.clientConfiguration,
  node: Object.keys(nodeData.controlplanes ?? [])[0],
  endpoint: endpoint,
  timeouts: {
    read: kubeconfigTimeout,
  },
});

export const talosconfig = clientConfig.talosConfig;
export const kubeconfig = kubeconfigOutput.kubeconfigRaw;
