import { Namespace } from '@pulumi/kubernetes/core/v1';
import { clusterIssuers, ingresses, provider, realms, shared } from '@unmango/thecluster/cluster/from-stack';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { hosts, releaseName, servicePort, versions } from './config';
import { certificate } from '@unmango/thecluster/util';
import { interpolate } from '@pulumi/pulumi';
import { client, readersGroup } from './oauth';

const ns = new Namespace('minio-operator', {
  metadata: { name: 'minio-operator' },
}, { provider });

const chart = new Chart('minio-operator', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    operator: {
      operator: {
        image: {
          repository: 'quay.io/minio/operator',
          tag: versions.minioOperator,
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
        volumes: [certificate('root-tls', {
          issuer: clusterIssuers.root,
          issuerKind: 'ClusterIssuer',
          commonName: hosts.external,
          caFile: 'ca-certificates.crt',
          certificateFile: 'tls.crt',
          privateKeyFile: 'tls.key',
          reusePrivateKey: false,
        })],
        volumeMounts: [{
          name: 'root-tls',
          mountPath: '/etc/ssl/certs',
          readOnly: true,
        }],
        env: [
          { name: 'OPERATOR_STS_ENABLED', value: 'off' },
          { name: 'MINIO_CONSOLE_TLS_ENABLE', value: 'on' },
          { name: 'WATCHED_NAMESPACE', value: shared.namespaces.minio },
          { name: 'MINIO_OPERATOR_IMAGE', value: interpolate`quay.io/minio/operator:${versions.minioOperator}` },
        ],
      },
      console: {
        image: {
          repository: 'quay.io/minio/operator',
          tag: versions.minioOperator,
        },
        securityContext: {
          runAsUser: 1001,
          runAsNonRoot: true,
        },
        containerSecurityContext: {
          runAsUser: 1001,
          runAsNonRoot: true,
        },
        ingress: {
          enabled: true,
          ingressClassName: ingresses.internal,
          annotations: {
            'cert-manager.io/cluster-issuer': clusterIssuers.stage,
          },
          tls: [{
            secretName: 'minio-console-tls',
            hosts: [hosts.internal],
          }],
          host: 'minio.lan.thecluster.io',
          pathType: 'ImplementationSpecific',
        },
        volumes: [certificate('root-tls', {
          issuer: clusterIssuers.root,
          issuerKind: 'ClusterIssuer',
          commonName: hosts.internal,
          caFile: 'ca-certificates.crt',
          certificateFile: 'tls.crt',
          privateKeyFile: 'tls.key',
          reusePrivateKey: false,
        })],
        volumeMounts: [{
          name: 'root-tls',
          mountPath: '/etc/ssl/certs',
          readOnly: true,
        }],
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
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://console:${servicePort}` },
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
        hosts: [hosts.external],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
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
