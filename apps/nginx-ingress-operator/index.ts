import { kustomize } from '@pulumi/kubernetes';
import { provider, shared } from '@unmango/thecluster/cluster/from-stack';
import versions from './config';

const nginxCrds = new kustomize.Directory('nginx-ingress-crds', {
  directory: `https://github.com/nginxinc/kubernetes-ingress/tree/${versions.nginxIngress}/config/crd`,
}, { provider });

const operator = new kustomize.Directory('nginx-ingress-helm-operator', {
  directory: `https://github.com/nginxinc/nginx-ingress-helm-operator/tree/${versions.nginxIngressHelmOperator}/config/default`,
}, { provider });
