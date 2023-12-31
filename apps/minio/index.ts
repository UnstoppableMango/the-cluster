import { interpolate } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';
import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { apps, clusterIssuers, ingresses, provider, realms, shared, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { Certificate } from '@unmango/thecluster-crds/certmanager/v1';
import { client, readersGroup } from './oauth';
import { hosts, releaseName, servicePort, versions } from './config';

const ns = Namespace.get('mini', shared.namespaces.minio, { provider });

const adminPassword = new RandomPassword('admin', {
  length: 48,
});

const secret = new Secret('minio', {
  metadata: {
    name: 'minio',
    namespace: ns.metadata.name,
  },
  stringData: {
    'config.env': interpolate`
export MINIO_ROOT_USER="minio-admin"
export MINIO_ROOT_PASSWORD="${adminPassword.result}"`,
  },
}, { provider });

const cert = new Certificate('minio-tls', {
  metadata: {
    name: 'minio-tls',
    namespace: ns.metadata.name,
  },
  spec: {
    issuerRef: clusterIssuers.ref(x => x.root),
    secretName: 'minio-tls',
    commonName: 'minio.thecluster.io',
    dnsNames: [
      's3.thecluster.io',
      's3.lan.thecluster.io',
    ],
  },
}, { provider });

const chart = new Chart(releaseName, {
  path: './',
  namespace: ns.metadata.name,
  values: {
    tenant: {
      existingSecret: {
        name: secret.metadata.name,
      },
      tenant: {
        name: 'thecluster',
        image: {
          repository: 'quay.io/minio/minio',
          tag: versions.minio,
        },
        configuration: {
          name: secret.metadata.name,
        },
        pools: [{
          servers: 4,
          name: 'pool-0',
          volumesPerServer: 4,
          size: '100Gi',
          storageClassName: storageClasses.rbd,
          resources: {
            limits: {
              cpu: '100m',
              memory: '256Mi',
            },
            requests: {
              cpu: '100m',
              memory: '128Mi',
            },
          },
          securityContext: {
            runAsUser: 1001,
            runAsGroup: 1001,
            runAsNonRoot: true,
            fsGroup: 1001,
          },
          containerSecurityContext: {
            runAsUser: 1001,
            runAsGroup: 1001,
            runAsNonRoot: true,
          },
        }],
        certificates: {
          externalCaCertSecret: [cert.spec.apply(x => x?.secretName)],
          externalCertSecret: [cert.spec.apply(x => x?.secretName)],
          certConfig: {
            commonName: 's3.thecluster.io',
            organizationName: 'UnMango',
            dnsNames: [
              's3.thecluster.io',
              's3.lan.thecluster.io',
            ],
          },
        },
        buckets: [{
          name: 'thecluster-s3',
        }],
        exposeServices: {
          minio: true,
          console: true,
        },
        serviceMetadata: {
          consoleServiceAnnotations: {
            'metallb.universe.tf/address-pool': apps.metallb.pool,
            'metallb.universe.tf/allow-shared-ip': 'minio-svc',
            'metallb.universe.tf/loadBalancerIPs': '192.168.1.86',
          },
          minioServiceAnnotations: {
            'metallb.universe.tf/address-pool': apps.metallb.pool,
            'metallb.universe.tf/allow-shared-ip': 'minio-svc',
            'metallb.universe.tf/loadBalancerIPs': '192.168.1.86',
          },
        },
        // env: [],
      },
      ingress: {
        api: {
          enabled: true,
          ingressClassName: ingresses.internal,
          annotations: {
            'cert-manager.io/cluster-issuer': clusterIssuers.root,
          },
          host: 's3.lan.thecluster.io',
          tls: [{
            secretName: 'minio-api-tls',
            hosts: ['s3.lan.thecluster.io'],
          }],
        },
        console: {
          enabled: true,
          ingressClassName: ingresses.internal,
          annotations: {
            'cert-manager.io/cluster-issuer': clusterIssuers.root,
          },
          host: 'console.s3.lan.thecluster.io',
          tls: [{
            secretName: 'minio-api-tls',
            hosts: ['console.s3.lan.thecluster.io'],
          }],
        },
      },
    },
    'oauth2-proxy': {
      enabled: true,
      config: {
        clientID: client.clientId,
        clientSecret: client.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `https://thecluster-console:${servicePort}` },
        { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: 'http://0.0.0.0:4180' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: interpolate`https://${hosts.external}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: realms.external.issuerUrl },
        { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        { name: 'OAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_ACCESS_TOKEN', value: 'true' },
        { name: 'OAUTH2_PROXY_COOKIE_SECURE', value: 'true' },
        { name: 'OAUTH2_PROXY_REVERSE_PROXY', value: 'true' },
        { name: 'OAUTH2_PROXY_PASS_USER_HEADERS', value: 'true' }, // Not passing them for some reaons...
        { name: 'OAUTH2_PROXY_EMAIL_DOMAINS', value: '*' },
        { name: 'OAUTH2_PROXY_SKIP_PROVIDER_BUTTON', value: 'true' },
        { name: 'OAUTH2_PROXY_SET_XAUTHREQUEST', value: 'true' },
        { name: 'OAUTH2_PROXY_ALLOWED_GROUPS', value: interpolate`/${readersGroup.name},/WebAppReaders` },
        { name: 'OAUTH2_PROXY_OIDC_GROUPS_CLAIM', value: realms.groupsScopeName },
      ],
      service: {
        type: 'ClusterIP',
      },
      ingress: {
        enabled: true,
        className: ingresses.cloudflare,
        pathType: 'Prefix',
        hosts: ['s3.thecluster.io'],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'https',
          'cloudflare-tunnel-ingress-controller.strrl.dev/proxy-ssl-verify': 'false',
          'pulumi.com/skipAwait': 'true',
        },
      },
      resources: {
        limits: {
          cpu: '10m',
          memory: '64Mi',
        },
        requests: {
          cpu: '10m',
          memory: '64Mi',
        },
      },
    },
  },
}, { provider });
