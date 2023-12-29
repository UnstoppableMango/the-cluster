import { apps, provider, shared } from '@unmango/thecluster/cluster/from-stack';
import { ip } from './config';
import { interpolate } from '@pulumi/pulumi/output';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { versions } from './config';

shared.namespaces.nginxIngress.apply(x => {
  console.log(x);
})

const chart = new Chart('test', {
  path: './',
  namespace: shared.namespaces.nginxIngress,
  skipCRDRendering: false,
  values: {
    'internal-ingress': {
      controller: {
        image: {
          pullPolicy: 'IfNotPresent',
          repository: 'nginx/nginx-ingress',
          tag: interpolate`${versions.nginxIngress}-ubi`,
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
    'cluster-ingress': {
      controller: {
        image: {
          pullPolicy: 'IfNotPresent',
          repository: 'nginx/nginx-ingress',
          tag: interpolate`${versions.nginxIngress}-ubi`,
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
  },
}, { provider });

export { ip, versions };
