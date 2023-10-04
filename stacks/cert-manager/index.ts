import * as path from 'path';
import * as fs from 'fs';
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as yaml from 'yaml';

interface Chart {
  dependencies: {
    name: string;
    version: string;
  }[];
}

function getCertManagerVersion(): string {
  const chartYaml = fs.readFileSync('Chart.yaml', 'utf-8');
  const chart: Chart = yaml.parse(chartYaml);
  const certManager = chart.dependencies.find(x => x.name === 'cert-manager');

  if (!certManager) throw new Error('Unable to find cert-manager version');

  return certManager.version;
}

const crds = new k8s.yaml.ConfigFile('crds', {
  file: `https://github.com/cert-manager/cert-manager/releases/download/v${getCertManagerVersion()}/cert-manager.crds.yaml`,
});

const ns = new k8s.core.v1.Namespace('cert-manager', {
  metadata: { name: 'cert-manager' },
});

// Use a release because the cert-manager helm chart uses hooks
const release = new k8s.helm.v3.Release('cert-manager', {
  chart: './',
  name: 'cert-manager',
  namespace: ns.metadata.name,
  createNamespace: false,
  atomic: true,
  dependencyUpdate: true,
  lint: true,
  skipCrds: true,
}, { dependsOn: crds });
