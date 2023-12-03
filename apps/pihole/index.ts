import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from './clusters';
import { ip, versions } from './config';
import { pool } from './apps/metallb';
import { ingressClass } from './apps/cloudflare-ingress';
import { storageClass } from './apps/ceph-csi';

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
      image: { tag: versions.docker, },
      // Consider DNS over HTTPS
      ingress: {
        enabled: true,
        ingressClassName: ingressClass,
        hosts: ['pihole.thecluster.io'],
        annotations: {
          'pulumi.com/skipAwait': 'true',
        },
      },
      persistentVolumeClaim: {
        enabled: true,
        storageClass,
        accessModes: ['ReadWriteMany'],
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
      serviceWeb: {
        type: 'LoadBalancer',
        loadBalancerIP: ip,
        annotations: {
          'metallb.universe.tf/allow-shared-ip': 'pihole-svc',
          'metallb.universe.tf/address-pool': pool,
        },
      },
    },
  },
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'Ingress') return;

    obj.spec.rules[0].http.paths[0].pathType = 'Prefix';
  }],
}, { provider });

export { ip };
export const password = adminPassword.result;

const deployment = chart.getResource('apps/v1/Deployment', 'pihole');

const piholeProvider = new pihole.Provider('pihole', {
  url: pulumi.interpolate`http://${ip}`,
  password,
}, { dependsOn: chart.ready });

const piholeRecord = new pihole.DnsRecord('pihole', {
  domain: 'pihole.thecluster.lan',
  ip,
}, { provider: piholeProvider, dependsOn: deployment });

const adBlocker = new pihole.AdBlockerStatus('status', {
  enabled: true,
}, { provider: piholeProvider });

const relaxedGroup = new pihole.Group('relaxed', {
  name: 'relaxed',
  description: 'A group for clients with more rleaxed allow/deny rules',
  enabled: true,
}, { provider: piholeProvider });

export const domain = piholeRecord.domain;
