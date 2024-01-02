import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { clusterIssuers, provider, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { releaseName, servicePort, versions } from './config';

export const loadBalancerIP = '192.168.1.85';

const ns = new Namespace('gitlab', {
  metadata: { name: 'gitlab' },
}, { provider });

const cert = new Certificate('redis.thecluster.io', {
  metadata: {
    name: 'redis.thecluster.io',
    namespace: ns.metadata.name,
  },
  spec: {
    secretName: 'redis-tls',
    commonName: 'redis.thecluster.io',
    issuerRef: clusterIssuers.ref(x => x.root),
    ipAddresses: [loadBalancerIP],
    dnsNames: [
      'redis.thecluster.io',
      '*.redis.thecluster.io',
      'redis.lan.thecluster.io',
      '*.redis.lan.thecluster.io',
    ],
    uris: [
      'redis://thecluster.io',
      'redis://*.thecluster.io',
    ],
    subject: {
      organizations: ['UnMango'],
    },
  },
}, { provider });

const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    gitlab: {
      global: {
        edition: 'ce',
        // image: {
        //   registry: '',
        // },
        gitlabVersion: '16.7.0',
        hosts: {
          domain: 'lan.thecluster.io',
          hostSuffix: 'staging',
          // https: true,
        },
      },
    },
  },
}, { provider });

const service = chart.getResource('v1/Service', 'redis/redis-headless');

const serviceOutput = service.metadata.name;
export { versions, servicePort as port, serviceOutput as service };
