import { interpolate } from '@pulumi/pulumi';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { clusterIssuers, ingresses, provider, realms, shared, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { client, readersGroup } from './oauth';
import { hosts, releaseName, servicePort, versions } from './config';
import { core } from '@pulumi/kubernetes/types/input';

type Volume = core.v1.Volume;
type VolumeMount = core.v1.VolumeMount;

const ns = Namespace.get(
  'media',
  shared.namespaces.media,
  { provider },
);

const chart = new Chart(releaseName, {
  path: '../../charts/deemix',
  namespace: ns.metadata.name,
  values: {
    global: {
      uid: 1001,
      gid: 1001,
    },
    image: { tag: versions.deemix },
    persistence: {
      config: {
        enabled: true,
        storageClassName: storageClasses.rbd,
      },
    },
    extraVolumes: <Volume[]>[{
      name: 'music',
      persistentVolumeClaim: {
        claimName: 'music',
      },
    }],
    extraVolumeMounts: <VolumeMount[]>[{
      name: 'music',
      mountPath: '/downloads',
    }],
    ingress: {
      enabled: true,
      ingressClassName: ingresses.nginx,
      annotations: {
        // 'cert-manager.io/cluster-issuer': clusterIssuers.stage,
        'external-dns.alpha.kubernetes.io/hostname': [
          hosts.internal,
          ...hosts.aliases.internal,
        ].join(','),
      },
      host: hosts.internal,
      path: '/deemix',
      tls: {
        enabled: true,
      },
    },
    resources: {
      limits: {
        cpu: '100m',
        memory: '128Mi',
      },
      requests: {
        cpu: '100m',
        memory: '128Mi',
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
        { name: 'OAUTH2_PROXY_UPSTREAMS', value: `http://${releaseName}:${servicePort}` },
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
        path: '/deemix',
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

export { hosts, versions }
