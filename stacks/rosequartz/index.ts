import * as path from 'path';
import * as pulumi from "@pulumi/pulumi";
import * as command from '@pulumi/command';

interface Versions {
  k8s: string
  talos: string
}

const config = new pulumi.Config();
const stack = pulumi.getStack();

const versions = config.requireObject<Versions>('versions');
const nodeIp = config.require('nodeIp');
const endpoint = `https://${nodeIp}:6443`;
const clusterName = config.require('clusterName');

const talosDir = path.join('.talos', stack);
const secretsFile = path.join(talosDir, 'secrets.yaml');
const controlplaneFile = path.join(talosDir, 'controlplane.yaml');
const workerFile = path.join(talosDir, 'worker.yaml');
const talosconfigFile = path.join(talosDir, 'talosconfig');

const kubeDir = path.join('.kube', stack);
const kubeconfigFile = path.join(kubeDir, 'config');

const genSecretsScript = 'scripts/gen-secrets.sh';
const genConfigScript = 'scripts/gen-config.sh';

const createFile = (file: pulumi.Input<string>, contents: pulumi.Input<string>) => command.local.runOutput({
  command: pulumi.interpolate`mkdir -p "$(dirname "${file}")" && cat >"${file}"`,
  stdin: contents,
});

const genSecrets = new command.local.Command('gen-secrets', {
  environment: {
    ROSEQUARTZ_SECRETS_FILE: secretsFile,
    ROSEQUARTZ_TALOS_VERSION: versions.talos,
  },
  create: genSecretsScript,
  update: 'echo "$PULUMI_COMMAND_STDOUT" >"$ROSEQUARTZ_SECRETS_FILE"',
  delete: 'rm "$ROSEQUARTZ_SECRETS_FILE" || true',
}, {
  additionalSecretOutputs: ['stdout'],
  deleteBeforeReplace: true,
});

createFile(secretsFile, genSecrets.stdout);

const genControlPlaneConfig = new command.local.Command('gen-controlplane-config', {
  environment: {
    ROSEQUARTZ_SECRETS_FILE: secretsFile,
    ROSEQUARTZ_OUTPUT_TYPE: 'controlplane',
    ROSEQUARTZ_CLUSTER_NAME: clusterName,
    ROSEQUARTZ_ENDPOINT: endpoint,
    ROSEQUARTZ_K8S_VERSION: versions.k8s,
    ROSEQUARTZ_TALOS_VERSION: versions.talos,
  },
  create: genConfigScript,
  delete: `rm ${controlplaneFile} || true`,
}, {
  dependsOn: genSecrets,
  additionalSecretOutputs: ['stdout'],
  deleteBeforeReplace: true,
});

createFile(controlplaneFile, genControlPlaneConfig.stdout);

const genWorkerConfig = new command.local.Command('gen-worker-config', {
  environment: {
    ROSEQUARTZ_SECRETS_FILE: secretsFile,
    ROSEQUARTZ_OUTPUT_TYPE: 'worker',
    ROSEQUARTZ_CLUSTER_NAME: clusterName,
    ROSEQUARTZ_ENDPOINT: endpoint,
    ROSEQUARTZ_K8S_VERSION: versions.k8s,
    ROSEQUARTZ_TALOS_VERSION: versions.talos,
  },
  create: genConfigScript,
  delete: `rm ${workerFile} || true`,
}, {
  dependsOn: genSecrets,
  additionalSecretOutputs: ['stdout'],
  deleteBeforeReplace: true,
});

createFile(workerFile, genWorkerConfig.stdout);

const shouldGenerate = config.requireBoolean('generateTalosconfig');
const genTalosConfig = new command.local.Command('gen-talos-config', {
  environment: {
    ROSEQUARTZ_SECRETS_FILE: secretsFile,
    ROSEQUARTZ_OUTPUT_TYPE: 'talosconfig',
    ROSEQUARTZ_CLUSTER_NAME: clusterName,
    ROSEQUARTZ_ENDPOINT: endpoint,
    ROSEQUARTZ_K8S_VERSION: versions.k8s,
    ROSEQUARTZ_TALOS_VERSION: versions.talos,
    ROSEQUARTZ_NODE_IP: nodeIp,
  },
  create: shouldGenerate ? genConfigScript : `cat ${talosconfigFile}`,
  delete: shouldGenerate ? `rm ${talosconfigFile} || true` : undefined,
}, {
  dependsOn: genSecrets,
  additionalSecretOutputs: ['stdout'],
  deleteBeforeReplace: true,
});

createFile(talosconfigFile, genTalosConfig.stdout);

const createCluster = new command.local.Command('create-cluster', {
  environment: {
    ROSEQUARTZ_CLUSTER_NAME: clusterName,
    ROSEQUARTZ_NODE_IP: nodeIp,
    ROSEQUARTZ_K8S_VERSION: versions.k8s,
    ROSEQUARTZ_TALOS_VERSION: versions.talos,
    ROSEQUARTZ_TALOS_STATE: path.join(talosDir, 'clusters'),
    ROSEQUARTZ_TALOSCONFIG: talosconfigFile,
    ROSEQUARTZ_KUBECONFIG: kubeconfigFile,
  },
  create: 'scripts/create-cluster.sh',
  delete: 'scripts/destroy-cluster.sh',
}, {
  dependsOn: [
    genControlPlaneConfig,
    genWorkerConfig,
    genTalosConfig,
  ],
  deleteBeforeReplace: true,
});

const applyConfig = new command.local.Command('apply-config', {
  environment: {
    ROSEQUARTZ_MACHINECONFIG: controlplaneFile,
    ROSEQUARTZ_TALOSCONFIG: talosconfigFile,
    ROSEQUARTZ_NODE_IP: nodeIp,
    ROSEQUARTZ_DELAY: '5',
  },
  create: 'scripts/apply-config.sh',
}, {
  dependsOn: [genControlPlaneConfig, genTalosConfig],
});

const bootstrap = new command.local.Command('bootstrap', {
  environment: {
    ROSEQUARTZ_CLUSTER_NAME: clusterName,
    ROSEQUARTZ_MACHINECONFIG: controlplaneFile,
    ROSEQUARTZ_TALOSCONFIG: talosconfigFile,
    ROSEQUARTZ_NODE_IP: nodeIp,
    ROSEQUARTZ_DELAY: '5',
  },
  create: 'scripts/bootstrap.sh',
}, {
  dependsOn: applyConfig,
});

export const secretsYaml = genSecrets.stdout;
export const controlplaneYaml = genControlPlaneConfig.stdout;
export const talosconfig = genTalosConfig?.stdout ?? '';
