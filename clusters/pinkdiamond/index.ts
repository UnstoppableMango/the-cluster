import { jsonStringify } from '@pulumi/pulumi';
import * as talos from '@pulumiverse/talos';
import { machine } from '@pulumiverse/talos/types/input';
import * as YAML from 'yaml';
import { Node, Versions, caPem, config, stack } from './config';
import * as certs from './certs';
import { b64e } from './util';

const controlPlanes = config.requireObject<Node[]>('controlplanes');
const workers = config.requireObject<Node[]>('workers');
export const certSans = config.requireObject<string[]>('certSans');
export const versions = config.requireObject<Versions>('versions');
export const clusterName = config.require('clusterName');
export const endpoint = config.require('endpoint');
export const vip = config.get('vip');
export const clusterEndpoint = config.require('clusterEndpoint');

const secrets = new talos.machine.Secrets('secrets');
const machineSecrets = {
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
};

const controlplaneConfig = talos.machine.getConfigurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'controlplane',
  docs: false,
  examples: false,
  machineSecrets,
  configPatches: [jsonStringify({
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
              'audit': 'restricted',
              'audit-version': 'latest',
              'enforce': 'baseline',
              'enforce-version': 'latest',
              'warn': 'restricted',
              'warn-version': 'latest',
            },
            exemptions: {
              namespaces: [
                'ceph-system',
                'kube-vip',
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
          ],
        },
      },
    },
  })],
});

const workerConfig = talos.machine.getConfigurationOutput({
  clusterName: clusterName,
  clusterEndpoint: clusterEndpoint,
  machineType: 'worker',
  docs: false,
  examples: false,
  kubernetesVersion: versions.k8s,
  machineSecrets,
  configPatches: [YAML.stringify({
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
  })],
});

const clientConfiguration = {
  caCertificate: certs.os.cert.certPem.apply(b64e),
  clientCertificate: certs.admin.cert.certPem.apply(b64e),
  clientKey: certs.admin.key.privateKeyPem.apply(b64e),
};

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

const controlPlaneConfigApply: talos.machine.ConfigurationApply[] = controlPlanes
  .map(x => new talos.machine.ConfigurationApply(x.ip, {
    clientConfiguration,
    machineConfigurationInput: controlplaneConfig.machineConfiguration,
    node: x.ip,
    configPatches: [
      ...configPatches,
      jsonStringify({
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
  }));

const workerConfigApply: talos.machine.ConfigurationApply[] = workers
  .map(x => new talos.machine.ConfigurationApply(x.ip, {
    clientConfiguration,
    machineConfigurationInput: workerConfig.machineConfiguration,
    node: x.ip,
    configPatches: [jsonStringify({
      machine: {
        install: {
          disk: x.installDisk,
        },
      },
    })],
  }));

const bootstrap = new talos.machine.Bootstrap('bootstrap', {
  clientConfiguration,
  node: endpoint,
  endpoint: endpoint,
}, {
  dependsOn: [
    ...controlPlaneConfigApply,
    ...workerConfigApply,
  ],
});

const kubeconfigOutput = talos.cluster.getKubeconfigOutput({
  clientConfiguration,
  node: controlPlanes[0].ip,
  endpoint: endpoint,
  timeouts: {
    read: config.require('kubeconfigTimeout'),
  },
});

talos.cluster.getHealthOutput({
  clientConfiguration,
  controlPlaneNodes: controlPlanes.map(x => x.ip),
  workerNodes: workers.map(x => x.ip),
  endpoints: controlPlanes.map(x => x.ip),
  timeouts: {
    read: config.require('healthTimeout'),
  },
});

export const talosconfig = clientConfig.talosConfig;
export const kubeconfig = kubeconfigOutput.kubeconfigRaw;
export const kubernetesClientConfig = kubeconfigOutput.kubernetesClientConfiguration;
