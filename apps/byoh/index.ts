import { CustomResourceOptions } from '@pulumi/pulumi';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const chart = new Chart('byoh', {
  path: './',
  transformations: [patchControllerImage],
}, { provider });

function patchControllerImage(obj: any, opt: CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;
  if (obj.metadata.name !== 'byoh-controller-manager') return;

  obj.spec.template.spec.containers.forEach((x: any) => {
    if (x.name !== 'manager') return;
    x.image = 'ghcr.io/unstoppablemango/byoh:v2.0.5';
  });
}
