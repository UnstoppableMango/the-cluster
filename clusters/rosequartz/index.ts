import * as talos from '@pulumiverse/talos';
import * as YAML from 'yaml';
import { Node, Versions, config } from './config';

const controlPlanes = config.requireObject<Node[]>('controlplanes');
export const certSans = config.requireObject<string[]>('certSans');
export const clusterName = config.require('clusterName');
export const endpoint = config.require('endpoint');
certSans.push(endpoint);

export const vip = config.get('vip');
if (vip) certSans.push(vip);

export const clusterEndpoint = config.require('clusterEndpoint');
export const versions = config.requireObject<Versions>('versions');
const secrets = new talos.machine.Secrets('secrets');

const controlplaneConfig = talos.machine.getConfigurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'controlplane',
  machineSecrets: {
    certs: {
      etcd: {
        cert: certs.etcd.cert.certPem,
        key: certs.etcd.key.privateKeyPem,
      },
      k8s: {
        cert: certs.k8s.cert.certPem,
        key: certs.k8s.key.privateKeyPem,
      },
      k8s_aggregator: {
        cert: certs.aggregator.cert.certPem,
        key: certs.aggregator.key.privateKeyPem,
      },
      k8s_serviceaccount: {
        key: certs.serviceAccount.key.privateKeyPem,
      },
      os: {
        cert: certs.os.cert.certPem,
        key: certs.os.key.privateKeyPem,
      },
    },
    cluster: secrets.machineSecrets.cluster,
    secrets: secrets.machineSecrets.secrets,
    trustdinfo: secrets.machineSecrets.trustdinfo,
  },
  docs: false,
  examples: false,
});

const clientConfig = talos.client.getConfigurationOutput({
  clusterName: clusterName,
  clientConfiguration: secrets.clientConfiguration,
  endpoints: controlPlanes.map(x => x.ip),
  nodes: [controlPlanes[0].ip],
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

const controlplaneConfigApply: talos.machine.ConfigurationApply[] = controlPlanes
  .map(x => (new talos.machine.ConfigurationApply(x.ip, {
    clientConfiguration: secrets.clientConfiguration,
    machineConfigurationInput: controlplaneConfig.machineConfiguration,
    node: x.ip,
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
            disk: x.installDisk,
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

const bootstrap = new talos.machine.Bootstrap('bootstrap', {
  clientConfiguration: secrets.clientConfiguration,
  node: endpoint,
  endpoint: endpoint,
  timeouts: {
    create: config.require('createTimeout'),
  },
}, { dependsOn: controlplaneConfigApply });

const kubeconfigOutput = talos.cluster.getKubeconfigOutput({
  clientConfiguration: secrets.clientConfiguration,
  node: endpoint,
  endpoint: endpoint,
  timeouts: {
    read: config.require('kubeconfigTimeout'),
  },
});

const healthCheck = talos.cluster.getHealthOutput({
  clientConfiguration: secrets.clientConfiguration,
  controlPlaneNodes: controlplaneConfigApply.map(x => x.node),
  endpoints: [endpoint],
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
  kc.clusters[0].cluster.server = `https://${config.require('primaryDnsName')}:6443`;
  return YAML.stringify(kc);
}
