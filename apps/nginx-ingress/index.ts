import { NginxIngress } from '@unmango/thecluster-crds/charts/v1alpha1';
import { apps, provider, shared, versions } from '@unmango/thecluster/cluster/from-stack';
import { ip } from './config';
import { interpolate } from '@pulumi/pulumi/output';

const internal = new NginxIngress('internal', {
  metadata: {
    name: 'internal',
    namespace: shared.namespaces.nginxIngress,
    annotations: {
      'meta.helm.sh/release-name': 'internal-ingress',
      'meta.helm.sh/release-namespace': shared.namespaces.nginxIngress,
    },
  },
  spec: {
    controller: {
      image: {
        pullPolicy: 'IfNotPresent',
        repository: 'nginx/nginx-ingress',
        tag: interpolate`${versions.nginxIngressOperator.nginxIngress}-ubi`,
      },
      name: 'internal-nginx',
      kind: 'daemonset',
      ingressClass: {
        name: 'nginx',
        setAsDefaultIngress: false, // Consider in the future
      },
      // Lol poor
      nginxplus: false,
      // The operator manages these
      enableCustomResources: false,
      enableCertManager: true,
      healthStatus: true,
      hostnetwork: false,
      enableSnippets: true,
      service: {
        type: 'LoadBalancer',
        loadBalancerIP: ip,
        annotations: {
          'metallb.universe.tf/address-pool': apps.metallb.pool,
        },
      },
    },
  },
}, { provider });

const cluster = new NginxIngress('cluster', {
  metadata: {
    name: 'cluster',
    namespace: shared.namespaces.nginxIngress,
    annotations: {
      'meta.helm.sh/release-name': 'cluster-ingress',
      'meta.helm.sh/release-namespace': shared.namespaces.nginxIngress,
    },
  },
  spec: {
    controller: {
      image: {
        pullPolicy: 'IfNotPresent',
        repository: 'nginx/nginx-ingress',
        tag: interpolate`${versions.nginxIngressOperator.nginxIngress}-ubi`,
      },
      name: 'cluster-nginx',
      kind: 'daemonset',
      ingressClass: {
        name: 'cluster-nginx',
      },
      // Lol poor
      nginxplus: false,
      // The operator manages these
      enableCustomResources: false,
      enableCertManager: true,
      healthStatus: true,
      hostnetwork: false,
      enableSnippets: true,
      service: {
        // TODO: Static IP since this is kinda important?
        type: 'ClusterIP',
      },
    },
  },
}, { provider });

export const internalClass = internal.spec.apply(x => x?.controller.ingressClass.name);
export const clusterClass = cluster.spec.apply(x => x?.controller.ingressClass.name);
export { ip };
