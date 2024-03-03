import { jsonStringify } from '@pulumi/pulumi';
import * as talos from '@pulumiverse/talos';
import { machine } from '@pulumiverse/talos/types/input';
import * as YAML from 'yaml';
import { Node, Versions, caPem, config, stack } from './config';
import * as certs from './certs';
import { b64e } from './util';

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

const clientConfiguration = {
  caCertificate: certs.os.cert.certPem.apply(b64e),
  clientCertificate: certs.admin.cert.certPem.apply(b64e),
  clientKey: certs.admin.key.privateKeyPem.apply(b64e),
};

const controlplaneConfig = talos.machine.getConfigurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'controlplane',
  docs: false,
  examples: false,
  machineSecrets: {
    cluster: secrets.machineSecrets.cluster,
    secrets: secrets.machineSecrets.secrets,
    trustdinfo: secrets.machineSecrets.trustdinfo,
    certs: {
      etcd: {
        cert: certs.etcd.cert.certPem.apply(b64e),
        key: certs.etcd.key.privateKeyPem.apply(b64e),
      },
      k8s: {
        cert: certs.k8s.cert.certPem.apply(b64e),
        key: certs.k8s.key.privateKeyPem.apply(b64e),
      },
      // Fake field
      k8s_aggregator: {
        cert: certs.aggregator.cert.certPem.apply(b64e),
        key: certs.aggregator.key.privateKeyPem.apply(b64e),
      },
      // Actual field
      k8sAggregator: {
        cert: certs.aggregator.cert.certPem.apply(b64e),
        key: certs.aggregator.key.privateKeyPem.apply(b64e),
      },
      // Fake field
      k8s_serviceaccount: {
        key: certs.serviceAccount.key.privateKeyPem.apply(b64e),
      },
      // Actual field
      k8sServiceaccount: {
        key: certs.serviceAccount.key.privateKeyPem.apply(b64e),
      },
      os: {
        cert: certs.os.cert.certPem.apply(b64e),
        key: certs.os.key.privateKeyPem.apply(b64e),
      },
    } as machine.CertificatesArgs,
  },
});

const clientConfig = talos.client.getConfigurationOutput({
  clusterName: clusterName,
  clientConfiguration,
  endpoints: controlPlanes.map(x => x.ip),
  nodes: [controlPlanes[0].ip],
});

const configPatches: string[] = [];

if (stack === 'prod') {
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
  .map(x => new talos.machine.ConfigurationApply(x.ip, {
    clientConfiguration,
    machineConfigurationInput: controlplaneConfig.machineConfiguration,
    node: x.ip,
    configPatches: [
      ...configPatches,
      jsonStringify({
        cluster: {
          allowSchedulingOnControlPlanes: true,
          apiServer: {
            certSANs: certSans,
          },
          extraManifests: [
            `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${versions.ksca}/deploy/ha-install.yaml`,
          ],
        },
        machine: {
          install: {
            disk: x.installDisk,
            image: `factory.talos.dev/installer/376567988ad370138ad8b2698212367b8edcb69b5fd68c80be1f2ec7d603b4ba:v${versions.talos}`,
          },
          certSANs: certSans,
          kubelet: {
            extraArgs: {
              'rotate-server-certificates': true,
            },
          },
          files: [
            {
              content: caPem,
              path: '/etc/ssl/certs/ca-certificates',
              permissions: 644,
              op: 'append',
            },
            {
              content: certs.cloudflare.cert.certificate,
              path: '/etc/ssl/certs/ca-certificates',
              permissions: 644,
              op: 'append',
            },
          ],
        },
      }),
    ],
  }));

const bootstrap = new talos.machine.Bootstrap('bootstrap', {
  clientConfiguration,
  node: endpoint,
  endpoint: endpoint,
  timeouts: {
    create: config.require('createTimeout'),
  },
}, { dependsOn: controlplaneConfigApply });

const kubeconfigOutput = talos.cluster.getKubeconfigOutput({
  clientConfiguration,
  node: bootstrap.endpoint,
  endpoint: bootstrap.endpoint,
  timeouts: {
    read: config.require('kubeconfigTimeout'),
  },
});

const healthCheck = talos.cluster.getHealthOutput({
  clientConfiguration: clientConfiguration,
  controlPlaneNodes: controlplaneConfigApply.map(x => x.node),
  endpoints: [bootstrap.endpoint],
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
