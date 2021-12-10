import { Secret } from '@pulumi/kubernetes/core/v1';
import * as pulumi from '@pulumi/pulumi';
import { IngressRoute } from '@unmango/custom-resources';
import { MetalLb, TlsStore, Traefik, TraefikConfig } from './resources';
import * as certManager from './resources/cert-manager/certmanager/v1';

const config = new pulumi.Config();

// const project = new rancher.Project('networking', {
//   name: 'Networking',
//   clusterId: theCluster.id,
// });

// const metallb = new MetalLb('metallb', {
//   version: '2.2.0',
//   addresses: ['192.168.1.75-192.168.1.99'],
// });

// const traefikConfig = config.requireObject<TraefikConfig>('traefik');

// const traefik = new Traefik('traefik', {
//   version: '9.14.2',
//   pilotToken: traefikConfig.pilot.token,
// }, { dependsOn: metallb.chart });

const cfConfig = config.requireObject<CloudflareConfig>('cloudflare');

const cloudflareSecret = new Secret('cloudflare', {
  metadata: { namespace: 'cert-manager' },
  stringData: {
    apiKey: cfConfig.apiKey,
    apiToken: cfConfig.apiToken,
  },
});

const leConfig = config.requireObject<LetsEnryptConfig>('letsEncrypt');
const leEnv = leConfig.useProd ? leConfig.prod : leConfig.staging;

// const leIssuer = new certManager.ClusterIssuer('letsencrypt', {
//   spec: {
//     acme: {
//       email: leConfig.email,
//       server: leEnv.server,
//       privateKeySecretRef: {
//         name: leEnv.accountKeyName,
//       },
//       solvers: [{
//         dns01: {
//           cloudflare: {
//             email: leConfig.email,
//             // Only one is required
//             // apiKeySecretRef: {
//             //   name: cloudflareSecret.metadata.name,
//             //   key: 'apiKey',
//             // },
//             apiTokenSecretRef: {
//               name: cloudflareSecret.metadata.name,
//               key: 'apiToken',
//             },
//           },
//         },
//       }],
//     },
//   },
// });

// const defaultCert = new certManager.Certificate('default', {
//   metadata: { namespace: 'traefik-system' },
//   spec: {
//     secretName: 'default-tls-cert',
//     duration: '2160h', // 90d
//     renewBefore: '360h', //15d
//     dnsNames: [
//       'unmango.net',
//       '*.unmango.net',
//       '*.int.unmango.net',
//     ],
//     issuerRef: {
//       name: pulumi.output(leIssuer.metadata).apply(x => x?.name ?? ''),
//       kind: leIssuer.kind.apply(x => x ?? ''),
//     },
//   },
// });

// const tlsStore = new TlsStore('default', {
//   metadata: { name: 'default', namespace: 'traefik-system' },
//   secretName: defaultCert.spec.secretName,
// });

const dashboard = new IngressRoute('dashboard', {
  // metadata: { namespace: this.namespace.metadata.name },
  entrypoints: ['websecure'],
  hosts: ['traefik.int.unmango.net', 'traefik'],
  services: [{
    name: 'api@internal',
    kind: 'TraefikService',
  }],
});

interface CloudflareConfig {
  apiKey: string;
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
