import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as nginx from '@pulumi/crds/charts/v1alpha1/nginxIngress';
import { provider } from './clusters';
import { loadBalancerClass } from './apps/metallb';
import { versions } from './config';

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
      service: { create: false },
    },
  },
}, { provider });

const internalSvc = new k8s.core.v1.Service('internal', {
  metadata: {
    name: pulumi.interpolate`${internal.metadata.apply(x => x?.name)}-nginx-ingress-controller`,
    namespace: internalNs.metadata.name,
  },
  spec: {
    loadBalancerClass: loadBalancerClass,
    // Copied from the template
    type: 'LoadBalancer',
    selector: {
      'app.kubernetes.io/name': 'nginx-ingress',
      'app.kubernetes.io/instance': 'internal',
    },
    allocateLoadBalancerNodePorts: true,
    externalTrafficPolicy: 'Local',
    ports: [
      {
        name: 'http',
        protocol: 'TCP',
        port: 80,
        targetPort: 80,
      },
      {
        name: 'https',
        protocol: 'TCP',
        port: 443,
        targetPort: 443,
      },
    ],
  },
}, { provider, dependsOn: internal });

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
