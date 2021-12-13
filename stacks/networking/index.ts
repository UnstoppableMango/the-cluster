import { Secret } from '@pulumi/kubernetes/core/v1';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as certManager from './resources/cert-manager/certmanager/v1';
import * as traefik from './resources/traefik/traefik/v1alpha1';
import * as YAML from 'yaml';

const config = new pulumi.Config();

// const project = new rancher.Project('networking', {
//   name: 'Networking',
//   clusterId: theCluster.id,
// });

// const metallb = new MetalLb('metallb', {
//   version: '2.2.0',
//   addresses: ['192.168.1.75-192.168.1.99'],
// });

const metallbRelease = new k8s.helm.v3.Release('metallb', {
  name: 'metallb',
  chart: 'metallb',
  namespace: 'metallb-system',
  repositoryOpts: {
    repo: 'https://charts.bitnami.com/bitnami',
  },
  values: {
    configInline: YAML.stringify({
      'address-pools': [{
        name: 'default',
        protocol: 'layer2',
        addresses: [
          '192.168.1.75-192.168.1.99',
        ],
      }]
    }),
  },
});

const traefikChart = new k8s.helm.v3.Chart('traefik', {
  namespace: 'traefik-system',
  chart: 'traefik',
  fetchOpts: {
    repo: 'https://helm.traefik.io/traefik',
  },
  values: {
    deployment: { kind: 'DaemonSet' },
    ingressRoute: { dashboard: { enabled: false } },
    ports: { websecure: { tls: { enabled: true } } },
    // logs: { general: { level: 'DEBUG' } },
    // pilot: {
    //   enabled: true,
    //   token: args.pilotToken,
    // },
  },
  transformations: [(obj) => {
    // Either Helm or Pulumi doesn't want to put ALL
    // resources in the namespace above so do that here
    obj.metadata.namespace = 'traefik-system';
  }],
});

const dashboard = new traefik.IngressRoute('dashboard', {
  metadata: { namespace: 'traefik-system' },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      match: 'Host(`traefik.int.unmango.net`)',
      kind: 'Rule',
      services: [{
        name: 'api@internal',
        kind: 'TraefikService',
      }],
    }],
  },
}, { dependsOn: traefikChart.ready });

const cfConfig = config.requireObject<CloudflareConfig>('cloudflare');

const cloudflareSecret = new Secret('cloudflare', {
  metadata: { namespace: 'cert-manager' },
  stringData: {
    apiToken: cfConfig.apiToken,
  },
});

const leConfig = config.requireObject<LetsEnryptConfig>('letsEncrypt');
const leEnv = leConfig.useProd ? leConfig.prod : leConfig.staging;

const leIssuer = new certManager.ClusterIssuer('letsencrypt', {
  spec: {
    acme: {
      email: leConfig.email,
      server: leEnv.server,
      privateKeySecretRef: {
        name: leEnv.accountKeyName,
      },
      solvers: [{
        dns01: {
          cloudflare: {
            email: leConfig.email,
            apiTokenSecretRef: {
              name: cloudflareSecret.metadata.name,
              key: 'apiToken',
            },
          },
        },
      }],
    },
  },
});

const defaultCert = new certManager.Certificate('default', {
  metadata: { namespace: 'traefik-system' },
  spec: {
    secretName: 'default-tls-cert',
    duration: '2160h', // 90d
    renewBefore: '360h', //15d
    dnsNames: [
      'unmango.net',
      '*.unmango.net',
      '*.int.unmango.net',
    ],
    issuerRef: {
      name: pulumi.output(leIssuer.metadata).apply(x => x?.name ?? ''),
      kind: leIssuer.kind.apply(x => x ?? ''),
    },
  },
});

const tlsStore = new traefik.TLSStore('default', {
  metadata: { name: 'default', namespace: 'traefik-system' },
  spec: {
    defaultCertificate: {
      secretName: defaultCert.spec.secretName,
    },
  },
}, { dependsOn: traefikChart.ready });

interface CloudflareConfig {
  apiToken: string;
}

interface LetsEnryptConfig {
  email: string;
  useProd: boolean;
  staging: {
    server: string;
    accountKeyName: string;
  };
  prod: {
    server: string;
    accountKeyName: string;
  };
}
