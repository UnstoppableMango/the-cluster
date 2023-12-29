import { interpolate } from '@pulumi/pulumi';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { apps, provider, shared } from '@unmango/thecluster/cluster/from-stack';
import { ip, versions } from './config';
import { ConfigMap } from '@pulumi/kubernetes/core/v1';

const config = new ConfigMap('nginx-config', {
  metadata: {
    name: 'nginx-config',
    namespace: shared.namespaces.nginxIngress,
  },
  data: {
    'client-max-body-size': '0',
  },
}, { provider });

const chart = new Chart('nginx-ingress', {
  path: './',
  namespace: shared.namespaces.nginxIngress,
  skipCRDRendering: false,
  values: {
    'nginx-ingress': {
      controller: {
        customConfigMap: config.metadata.name,
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
        enableCustomResources: true,
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
  },
}, { provider });

export { ip, versions };
