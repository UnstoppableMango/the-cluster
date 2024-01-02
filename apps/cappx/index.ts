import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const chart = new k8s.helm.v3.Chart('cappx', {
  path: './',
  transformations: [patchProxmoxService],
}, { provider });

function patchProxmoxService(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Service') return;
  if (obj.metadata.name !== 'cluster-api-provider-proxmox-controller-manager-metrics-service') return;

  obj.metadata.labels['control-plane'] = 'capp-controller-manager';
  obj.spec.selector['control-plane'] = 'capp-controller-manager';
  obj.spec.selector['cluster.x-k8s.io/aggregate-to-manager'] = undefined
}
