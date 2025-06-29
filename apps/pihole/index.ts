import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { apps, ingresses, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { hostname, ip, versions } from './config';

const ns = new k8s.core.v1.Namespace('pihole', {
  metadata: { name: 'pihole' },
});

const adminPassword = new random.RandomPassword('admin', {
  length: 32,
});

const adminPasswordSecret = new k8s.core.v1.Secret('pihole', {
  metadata: {
    name: 'pihole',
    namespace: ns.metadata.name,
  },
  stringData: {
    adminPassword: adminPassword.result,
  },
});

const chart = new k8s.helm.v4.Chart('pihole', {
  chart: 'pihole',
  version: '2.26.1',
  repositoryOpts: {
    repo: 'https://mojo2600.github.io/pihole-kubernetes/',
  },
  namespace: ns.metadata.name,
  // https://artifacthub.io/packages/helm/mojo2600/pihole#values
  values: {
    pihole: {
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
      priorityClassName: 'system-node-critical',
      image: { tag: versions.docker, },
      // Consider DNS over HTTPS
      ingress: {
        enabled: true,
        ingressClassName: ingresses.theclusterIo,
        hosts: [hostname],
        annotations: {
          'pulumi.com/skipAwait': 'true',
        },
      },
      persistentVolumeClaim: {
        enabled: true,
        storageClass: storageClasses.rbd,
        accessModes: ['ReadWriteOnce'],
      },
      podDnsConfig: {
        enabled: true,
        policy: 'None',
        nameservers: [
          '127.0.0.1',
          '1.1.1.1',
        ],
      },
      // Pi-hole doesn't seem to HA well with the default config
      // replicaCount: 3,
      serviceDhcp: {
        type: 'LoadBalancer',
        loadBalancerIP: ip,
        annotations: {
          'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
          'metallb.universe.tf/address-pool': apps.metallb.pool,
        },
      },
      serviceDns: {
        type: 'LoadBalancer',
        loadBalancerIP: ip,
        annotations: {
          'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
          'metallb.universe.tf/address-pool': apps.metallb.pool,
        },
      },
      serviceWeb: {
        type: 'LoadBalancer',
        loadBalancerIP: ip,
        annotations: {
          'external-dns.alpha.kubernetes.io/hostname': 'pihole.lan.thecluster.io',
          'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
          'metallb.universe.tf/address-pool': apps.metallb.pool,
        },
      },
    },
  },
  // TODO
  // transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
  //   if (obj.kind !== 'Ingress') return;
  //   obj.spec.rules[0].http.paths[0].pathType = 'Prefix';
  // }],
});

export { ip, hostname };
export const password = adminPassword.result;
