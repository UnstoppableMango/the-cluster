import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as path from 'path';

interface Versions {
  clusterapi: string;
  proxmox: string;
  sidero: string;
  cabpt: string;
  cacppt: string;
  'cert-manager': string;
}

const config = new pulumi.Config();
const enabled = config.requireObject<string[]>('enabled');
const versions = config.requireObject<Versions>('versions');

const paths: string[] = [];

if (enabled.includes('cert-manager')) {
  paths.push(`https://github.com/cert-manager/cert-manager/releases/download/v${versions['cert-manager']}/cert-manager.crds.yaml`);
}

if (enabled.includes('clusterapi')) {
  paths.push(path.join('manifests', 'cluster-api-core', 'output.yaml'));
}

if (enabled.includes('proxmox')) {
  paths.push(path.join('manifests', 'proxmox-infrastructure', 'output.yaml'));
}

if (enabled.includes('sidero')) {
  paths.push(path.join('manifests', 'sidero-infrastructure', 'output.yaml'));
}

if (enabled.includes('cabpt')) {
  paths.push(path.join('manifests', 'talos-bootstrap', 'output.yaml'));
}

if (enabled.includes('cacppt')) {
  paths.push(path.join('manifests', 'talos-control-plane', 'output.yaml'));
}

const manifests = new k8s.yaml.ConfigGroup('crds', {
  files: paths,
}, {
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});
