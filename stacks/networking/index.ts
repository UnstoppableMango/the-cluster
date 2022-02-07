import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as rancher from '@pulumi/rancher2';
import * as certManager from '@pulumi/crds/certmanager/v1';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import * as YAML from 'yaml';
import { Tunnel } from './resources';
import { IngressRoute, Middleware } from '@pulumi/crds/traefik/v1alpha1';

const config = new pulumi.Config();

// TODO: Theres currently a bug importing this resource type (as repoted by the CLI).
// I should probably file an issue, but I'm not really in a rush to do Project stuff.
// const project = new rancher.Project('networking', {
//   name: 'Networking',
//   clusterId: 'the-cluster',
// }, { import: 'Networking' });

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
      }],
    }),
  },
});

const certManagerRelease = new k8s.helm.v3.Release('cert-manager', {
  name: 'cert-manager',
  chart: 'cert-manager',
  namespace: 'cert-manager',
  repositoryOpts: {
    repo: 'https://charts.jetstack.io',
  },
  values: {
    installCRDs: true,
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
    ports: {
      web: { redirectTo: 'websecure' },
      websecure: { tls: { enabled: true } },
    },
    providers: {
      kubernetesCRD: {
        allowCrossNamespace: true,
      },
    },
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

const cloudflareSecret = new k8s.core.v1.Secret('cloudflare', {
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

const unmangoNetCert = new certManager.Certificate('unmango-net', {
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
}, { aliases: [{ name: 'default' }] });

// I don't think this cert is ultimately being used because:
// - cloudflare provides their own TLS on the public end of the tunnel
// - I have cloudflared pointed at a *.unmango.net domain, which will use the unmango.net cert.
// - Traefik's docs on TLSStores are confusing, it sounds like non-default stores are ignored.
const theclusterIoCert = new certManager.Certificate('thecluster-io', {
  metadata: { name: 'thecluster-io', namespace: 'traefik-system' },
  spec: {
    secretName: 'thecluster-io-tls-cert',
    duration: '2160h', // 90d
    renewBefore: '360h', //15d
    dnsNames: [
      'thecluster.io',
      '*.thecluster.io',
      '*.int.thecluster.io',
    ],
    issuerRef: {
      name: pulumi.output(leIssuer.metadata).apply(x => x?.name ?? ''),
      kind: leIssuer.kind.apply(x => x ?? ''),
    },
  },
});

const unmangoNetTlsStore = new traefik.TLSStore('default', {
  metadata: { name: 'default', namespace: 'traefik-system' },
  spec: {
    defaultCertificate: {
      secretName: unmangoNetCert.spec.secretName,
    },
  },
}, { dependsOn: traefikChart.ready });

const theclusterIoTlsStore = new traefik.TLSStore('thecluster-io', {
  metadata: { name: 'thecluster-io', namespace: 'traefik-system' },
  spec: {
    defaultCertificate: {
      secretName: theclusterIoCert.spec.secretName,
    },
  },
}, { dependsOn: traefikChart.ready });

const tunnelNamespace = new rancher.Namespace('argo-tunnel', {
  projectId: 'local:p-54lnv', // Networking
  name: 'argo-tunnel',
});

const tunnel = new Tunnel('thecluster-io', {
  namespace: tunnelNamespace.name,
  cloudflare: {
    accountId: cfConfig.accountId,
    zone: 'thecluster.io',
  },
  dnsRecords: [
    'thecluster.io',
    'auth',
    'dash',
    'deemix',
    'deluge',
    'media',
    'rancher',
    'requests',
    'satisfactory',
    'minecraft',
    'unstoppablemango-actions',
    'unmango-actions',
  ],
  // Point to the internal traefik url for two reasons:
  // - No hard dependency on an IP if it changes
  // - I didn't include an IP in the SAN of any of my certs...
  ingresses: [{
    hostname: 'thecluster.io',
    service: 'https://traefik.int.unmango.net',
  }, {
    hostname: '*.thecluster.io',
    service: 'https://traefik.int.unmango.net',
  }],
});

const redirectToDashMiddleware = new Middleware('redirect-dash', {
  metadata: { name: 'redirect-dash', namespace: 'traefik-system' },
  spec: {
    redirectRegex: {
      regex: '^https?://thecluster.io',
      replacement: 'https://dash.thecluster.io',
    },
  },
});

const redirectToDash = new IngressRoute('redirect-dash', {
  metadata: { name: 'redirect-dash', namespace: 'traefik-system' },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: 'Host(`thecluster.io`)',
      middlewares: [{
        name: 'redirect-dash',
      }],
      services: [{
        name: 'noop@internal',
        kind: 'TraefikService',
      }],
    }],
  },
});

interface CloudflareConfig {
  accountId: string;
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
