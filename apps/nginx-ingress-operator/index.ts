import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import versions from './versions';

const operator = new k8s.kustomize.Directory('nginx-ingress-helm-operator', {
  directory: `https://github.com/nginxinc/nginx-ingress-helm-operator/tree/${versions.nginxIngressHelmOperator}/config/default`,
  // transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
  //   if (obj.kind !== 'DaemonSet') return;
  // }],
}, { provider });
