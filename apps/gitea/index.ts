import { CustomResourceOptions, interpolate } from '@pulumi/pulumi';
import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { apps, clusterIssuers, ingresses, provider, realms, shared, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { allHosts } from '@unstoppablemango/thecluster/util';
import { OAuthApplication } from '@unmango/thecluster-components/oauth';
import { PostgresDatabase } from '@unmango/thecluster-components/postgres-db';
import { releaseName, servicePort, versions, username, email, hosts } from './config';
import { certificate } from '@unstoppablemango/thecluster';
import { RandomPassword } from '@pulumi/random';
import { core } from '@pulumi/kubernetes/types/input';

export const loadBalancerIP = '192.168.1.87';

const ns = new Namespace('gitea', {
  metadata: {
    name: 'gitea',
    labels: {
      'thecluster.io/trust': 'thebundle',
    },
  },
}, { provider });

const password = new RandomPassword('admin', { length: 48 });

// const cert = new Certificate('redis.thecluster.io', {
//   metadata: {
//     name: 'redis.thecluster.io',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     secretName: 'redis-tls',
//     commonName: 'redis.thecluster.io',
//     issuerRef: clusterIssuers.ref(x => x.root),
//     ipAddresses: [loadBalancerIP],
//     dnsNames: [
//       'redis.thecluster.io',
//       '*.redis.thecluster.io',
//       'redis.lan.thecluster.io',
//       '*.redis.lan.thecluster.io',
//     ],
//     uris: [
//       'redis://thecluster.io',
//       'redis://*.thecluster.io',
//     ],
//     subject: {
//       organizations: ['UnMango'],
//     },
//   },
// }, { provider });

const oauth = new OAuthApplication('gitea', {
  name: 'Gitea',
  baseUrl: `https://${hosts.external}`,
  realmId: realms.external.id,
  hosts: allHosts(hosts),
}, { provider: apps.keycloak.provider });

const database = new PostgresDatabase('gitea', {}, { provider: apps.postgresqlLa.provider });

const secret = new Secret('gitea-secrets', {
  metadata: {
    name: 'gitea-secrets',
    namespace: ns.metadata.name,
  },
  stringData: {
    username,
    password: password.result,
    email,
    key: oauth.client.clientId,
    secret: oauth.client.clientSecret,
  },
}, { provider });

// https://gitea.com/gitea/helm-chart
const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    gitea: {
      global: {
        imageRegistry: 'docker.io',
        storageClass: storageClasses.rbd,
        // Could be useful in lieu of cluster ingress
        // hostAliases: [],
      },
      replicaCount: 1,
      image: {
        repository: 'gitea/gitea',
        tag: versions.gitea,
      },
      podSecurityContext: {
        fsGroup: 1001,
      },
      containerSecurityContext: {
        allowPrivilegeEscalation: false,
        capabilities: { drop: ['ALL'] },
        privileged: false,
        readOnlyRootFilesystem: true,
        runAsGroup: 1001,
        runAsNonRoot: true,
        runAsUser: 1001,
      },
      service: {
        http: {
          type: 'LoadBalancer',
          loadBalancerIP,
          port: 3000,
          annotations: {
            'external-dns.alpha.kubernetes.io/hostname': hosts.internal,
            'metallb.universe.tf/allow-shared-ip': 'gitea-svc',
          },
        },
        ssh: {
          type: 'LoadBalancer',
          loadBalancerIP,
          port: 22,
          annotations: {
            'external-dns.alpha.kubernetes.io/hostname': hosts.internal,
            'metallb.universe.tf/allow-shared-ip': 'gitea-svc',
          },
        },
      },
      ingress: {
        enabled: true,
        className: ingresses.theclusterIo,
        annotations: {
          'pulumi.com/skipAwait': 'true',
        },
        hosts: [{
          host: hosts.external,
          paths: [{
            pathType: 'Prefix',
            path: '/',
          }],
        }],
      },
      resources: {
        limits: {
          cpu: '2',
          memory: '2Gi',
        },
        memory: {
          cpu: '100m',
          memory: '512Mi',
        },
      },
      persistence: {
        size: '15Gi',
        accessModes: ['ReadWriteOnce'],
      },
      extraVolumeMounts: <core.v1.VolumeMount[]>[
        {
          name: 'postgres-tls',
          mountPath: '/data/gitea/git/.postgresql',
        },
        {
          name: 'thebundle',
          mountPath: '/etc/ssl/certs',
        },
      ],
      extraVolumes: <core.v1.Volume[]>[
        certificate('postgres-tls', {
          issuer: clusterIssuers.postgres,
          issuerKind: 'ClusterIssuer',
          commonName: database.owner.name,
          dnsNames: allHosts(hosts),
          uriSans: allHosts(hosts).flatMap(x => [
            `postgres://${x}`,
            `postgress://${x}`,
          ]),
          keyUsages: ['client auth'],
          certificateFile: 'postgresql.crt',
          privateKeyFile: 'postgresql.key',
          caFile: 'root.crt',
          reusePrivateKey: false,
          fsGroup: 1001,
        }),
        {
          name: 'thebundle',
          configMap: {
            name: 'thecluster-ca',
            defaultMode: 0o600,
            optional: false,
          },
        },
      ],
      gitea: {
        admin: {
          existingSecret: secret.metadata.name,
        },
        oauth: [{
          name: 'THECLUSTER',
          provider: 'openidConnect',
          existingSecret: secret.metadata.name,
          autoDiscoverUrl: realms.external.discoveryUrl,
          // useCustomUrls: '',
          // customAuthUrl: '',
          // customTokenUrl: '',
          // customProfileUrl: '',
          // customEmailUrl: '',
        }],
        config: {
          APP_NAME: 'THECLUSTER Gitea',
          // RUN_MODE: 'dev',
          server: {
            SSH_LISTEN_PORT: 2222,
          },
          database: {
            DB_TYPE: 'postgres',
            HOST: apps.postgresqlLa.clusterHostname, // TODO: Cert creds
            NAME: database.database.name,
            USER: database.owner.name,
            PASSWD: database.ownerPassword.result,
            SSL_MODE: 'disable',
          },
          cache: {
            ADAPTER: 'redis-cluster',
            HOST: interpolate`redis+cluster://:gitea@192.168.1.85:6379/0?pool_size=100&dle_timeout=180s`, // TODO
          },
        },
      },
      'redis-cluster': { enabled: false },
      'postgresql-ha': { enabled: false },
    },
  },
  transformations: [(obj: any, opts: CustomResourceOptions) => {
    // opts.dependsOn = cert;
  }],
}, { provider });

const service = chart.getResource('v1/Service', 'redis/redis-redis-cluster-headless');

const serviceOutput = service.metadata.name;
export { versions, servicePort as port, serviceOutput as service };
