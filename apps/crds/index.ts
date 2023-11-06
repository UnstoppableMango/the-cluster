import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

interface Dependency {
  enabled: boolean;
  version: string;
}

const config = new pulumi.Config();

const paths: string[] = [];

const certManager = config.getObject<Dependency>('cert-manager');
if (certManager?.enabled) {
  if (!certManager.version) throw new Error('cert-manager version was not defined');
  paths.push(`https://github.com/cert-manager/cert-manager/releases/download/v${certManager.version}/cert-manager.crds.yaml`);
}

const manifests = new k8s.yaml.ConfigGroup('crds', {
  files: paths,
}, {
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});
