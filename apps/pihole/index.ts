import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { ip } from './config';
import { pool } from './apps/metallb';

const ns = new k8s.core.v1.Namespace('pihole', {
  metadata: { name: 'pihole' },
}, { provider });

const adminPassword = new random.RandomPassword('admin', {
  length: 20,
});

const adminPasswordSecret = new k8s.core.v1.Secret('pihole', {
  metadata: {
    name: 'pihole',
    namespace: ns.metadata.name,
  },
  stringData: {
    adminPassword: adminPassword.result,
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('pihole', {
  path: './',
  namespace: ns.metadata.name,
  // https://artifacthub.io/packages/helm/mojo2600/pihole#values
  values: {
    DNS1: '1.1.1.1',
    DNS2: '1.0.0.1',
    admin: {
      existingSecret: adminPasswordSecret.metadata.name,
      passwordKey: 'adminPassword',
    },
    aniaff: {
      enabled: true,
      strict: false,
    },
    // Consider DNS over HTTPS
    ingress: {
      enabled: false, // We'll turn this on when we get oauth figured out
    },
    persistentVolumeClaim: {
      enabled: true,
    },
    podDnsConfig: {
      enabled: true,
      policy: 'None',
      nameservers: [
        '127.0.0.1',
        '1.1.1.1',
      ],
    },
    serviceWeb: {
      type: 'LoadBalancer',
      loadBalancerIP: ip,
      annotations: {
        'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
        'metallb.universe.tf/address-pool': pool,
      },
    },
    serviceDns: {
      type: 'LoadBalancer',
      loadBalancerIP: ip,
      annotations: {
        'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
        'metallb.universe.tf/address-pool': pool,
      },
    },
    serviceDhcp: {
      type: 'LoadBalancer',
      loadBalancerIP: ip,
      annotations: {
        'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
        'metallb.universe.tf/address-pool': pool,
      },
    },
  },
}, { provider });

export { ip };
