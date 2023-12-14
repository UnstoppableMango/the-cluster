import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const chart = new k8s.helm.v3.Chart('cabpt', {
  path: './',
  transformations: [patchControllerManagerPorts],
}, { provider });

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
