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
const talosconfigFile = path.join(talosDir, 'config');

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

const genTalosConfig = new command.local.Command('gen-talos-config', {
  environment: {
    ROSEQUARTZ_SECRETS_FILE: secretsFile,
    ROSEQUARTZ_OUTPUT_TYPE: 'talosconfig',
    ROSEQUARTZ_CLUSTER_NAME: clusterName,
    ROSEQUARTZ_ENDPOINT: endpoint,
    ROSEQUARTZ_K8S_VERSION: versions.k8s,
    ROSEQUARTZ_TALOS_VERSION: versions.talos,
  },
  create: genConfigScript,
  delete: `rm ${talosconfigFile} || true`,
}, {
  dependsOn: genSecrets,
  additionalSecretOutputs: ['stdout'],
  deleteBeforeReplace: true,
});

createFile(controlplaneFile, genControlPlaneConfig.stdout);
createFile(talosconfigFile, genTalosConfig.stdout);

export const secretsYaml = genSecrets.stdout;
export const controlplaneYaml = genControlPlaneConfig.stdout;
export const talosconfig = genTalosConfig.stdout;
