import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const chart = new k8s.helm.v3.Chart('capvc', {
  path: './',
  skipCRDRendering: false,
  transformations: [patchServiceSelector],
}, { provider });

function patchServiceSelector(obj: any, opts: pulumi.CustomResourceOptions) {
  if (obj.kind !== 'Service') return;
  if (obj.metadata.name !== 'cluster-api-provider-vcluster-metrics-service') return;
  obj.spec.selector['control-plane'] = 'cluster-api-provider-vcluster-controller-manager';
}
