import * as path from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const bootstrap = new k8s.yaml.ConfigGroup('bootstrap', {
  files: [
    'certificate',
    'clusterrole',
    'clusterrolebinding',
    'deployment',
    'issuer',
    'namespace',
    'role',
    'rolebinding',
    'service',
    'validatingwebhookconfiguration',
  ].map(x => path.join('manifests', `${x}.yaml`)),
  transformations: [patchControllerManagerPorts],
}, {
  provider,
  ignoreChanges: [
    // cert-manager injects `caBundle`s
    'spec.conversion.webhook.clientConfig.caBundle',
  ],
});

function patchControllerManagerPorts(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;

  const deployments = ['cabpt-controller-manager', 'cacppt-controller-manager'];

  if (!deployments.includes(obj.metadata.name)) return;

  // Seems to be a bug in the templates. Metrics binds to 8080, but there is no corresponding port
  obj.spec.template.spec.containers[0].ports.push({
    containerPort: 8080,
    name: 'https',
    protocol: 'TCP',
  });
}
