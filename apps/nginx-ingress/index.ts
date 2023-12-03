import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as nginx from '@pulumi/crds/charts/v1alpha1/nginxIngress';
import { provider } from './clusters';
import { loadBalancerClass, pool } from './apps/metallb';
import { ip, versions } from './config';

const internalNs = new k8s.core.v1.Namespace('internal-ingress', {
  metadata: { name: 'internal-ingress' },
}, { provider });

const internal = new nginx.NginxIngress('internal', {
  metadata: {
    name: 'internal',
    namespace: internalNs.metadata.name,
  },
  spec: {
    controller: {
      image: {
        pullPolicy: 'IfNotPresent',
        repository: 'nginx/nginx-ingress',
        tag: `${versions.nginxIngress}-ubi`,
      },
      name: 'internal-nginx',
      kind: 'daemonset',
      ingressClass: {
        name: 'nginx',
        setAsDefaultIngress: false, // Consider in the future
      },
      nginxplus: false,
      enableCustomResources: true,
      enableCertManager: true,
      healthStatus: true,
      hostnetwork: false,
      enableSnippets: true,
      service: {
        type: 'LoadBalancer',
        loadBalancerIP: ip,
        annotations: {
          'metallb.universe.tf/address-pool': pool,
        },
      },
    },
  },
}, { provider });

const clusterNs = new k8s.core.v1.Namespace('cluster-ingress', {
  metadata: { name: 'cluster-ingress' },
}, { provider });

const cluster = new nginx.NginxIngress('cluster', {
  metadata: {
    name: 'cluster',
    namespace: clusterNs.metadata.name,
  },
  spec: {
    controller: {
      image: {
        pullPolicy: 'IfNotPresent',
        repository: 'nginx/nginx-ingress',
        tag: `${versions.nginxIngress}-ubi`,
      },
      name: 'cluster-nginx',
      kind: 'daemonset',
      ingressClass: {
        name: 'cluster-nginx',
      },
      nginxplus: false,
      enableCustomResources: true,
      enableCertManager: true,
      healthStatus: true,
      hostnetwork: false,
      enableSnippets: true,
      service: {
        type: 'ClusterIP',
      },
    },
  },
}, { provider });

export const internalClass = internal.spec.apply(x => x?.controller.ingressClass.name);
export const clusterClass = cluster.spec.apply(x => x?.controller.ingressClass.name);
