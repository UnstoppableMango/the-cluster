import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as keycloak from '@pulumi/keycloak';
import * as pihole from '@unmango/pulumi-pihole';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { provider as keycloakProvider } from '@unmango/thecluster/apps/keycloak';
import { provider as piholeProvider, hostname, password } from '@unmango/thecluster/apps/pihole';
import { piholeConfig, versions } from './config';

const ns = new k8s.core.v1.Namespace('external-dns', {
  metadata: { name: 'external-dns' },
}, { provider });

const secret = new k8s.core.v1.Secret('exxternal-dns', {
  metadata: {
    name: 'external-dns',
    namespace: ns.metadata.name,
  },
  stringData: {
    EXTERNAL_DNS_PIHOLE_PASSWORD: password,
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('external-dns', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'pihole-dns': {
      // https://github.com/kubernetes-sigs/external-dns/tree/master/charts/external-dns#values
      domainFilters: [
        ...piholeConfig.externalDomains,
        ...piholeConfig.internalDomains.flatMap(domain => [
          `*.lan.${domain}`,
          `*.int.${domain}`,
          `*.local.${domain}`,
        ]),
      ],
      env: [{
        name: 'EXTERNAL_DNS_PIHOLE_PASSWORD',
        valueFrom: {
          secretKeyRef: {
            name: secret.metadata.name,
            key: 'EXTERNAL_DNS_PIHOLE_PASSWORD',
          },
        },
      }],
      image: {
        repository: 'registry.k8s.io/external-dns/external-dns',
        tag: versions.externalDns,
      },
      interval: '1m',
      logLevel: 'info',
      nameOverride: undefined, // Maybe
      namespaced: false,
      podSecurityContext: {
        runAsNonRoot: true,
        fsGroup: 65534,
        seccompProfile: {
          type: 'RuntimeDefault',
        },
      },
      policy: 'upsert-only', // 'upsert-only' or 'sync'
      priorityClassName: 'system-cluster-critical',
      provider: 'pihole',
      extraArgs: [pulumi.interpolate`--pihole-server=https://${hostname}`],
      rbac: { create: true },
      // Pi-hole doesn't support TXT records
      registry: 'noop', // 'txt', 'aws-sd', 'dynamodb', or 'noop'
      resources: {
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
      revisionHistoryLimit: 3,
      securityContext: {
        privileged: false,
        allowPrivilegeEscalation: false,
        readOnlyRootFilesystem: true,
        runAsNonRoot: true,
        runAsUser: 65532,
        runAsGroup: 65532,
        capabilities: { drop: ['ALL'] },
      },
      service: {
        port: 7979,
      },
      sources: ['service', 'ingress', 'node', 'kong-tcpingress'],
      triggerLoopOnEvent: true,
      txtOwnerId: undefined,
      txtPrefix: undefined,
      txtSuffix: undefined,
    },
    'cloudflare-dns': {
      enabled: false,
    },
  },
}, { provider });
