import * as fs from 'node:fs/promises';
import { interpolate } from '@pulumi/pulumi';
import { ConfigMap, Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { ingresses, provider, realms, shared, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { client, readersGroup } from './oauth';
import { hosts, mediaVolumes, releaseName, resources, servicePort, versions } from './config';
import { core } from '@pulumi/kubernetes/types/input';

type Volume = core.v1.Volume;
type VolumeMount = core.v1.VolumeMount;

const ns = Namespace.get(
  'media',
  shared.namespaces.media,
  { provider },
);

const assets = new ConfigMap('assets', {
  metadata: {
    name: 'assets',
    namespace: ns.metadata.name,
  },
  binaryData: {
    'logo.svg': fs.readFile('assets/logo.svg', 'base64'),
    'favicon.ico': fs.readFile('assets/favicon.ico', 'base64'),
  },
}, { provider });

const chart = new Chart(releaseName, {
  path: '../../charts/filebrowser',
  namespace: ns.metadata.name,
  values: {
    global: {
      uid: 1001,
      gid: 1001,
    },
    auth: {
      method: 'noauth',
      header: 'x-auth-request-preferred-username', // Might not be using this/getting set right
    },
    branding: {
      name: 'THECLUSTER',
      files: '/assets',
    },
    // We've got work to do dangit
    readinessProbe: { enabled: false },
    livenessProbe: { enabled: false },
    resources: {
      // limits: {
      //   cpu: '20m',
      //   memory: '64Mi',
      // },
      requests: {
        cpu: '20m',
        memory: '64Mi',
      },
    },
    image: { tag: versions.filebrowser },
    init: {
      image: { tag: versions.filebrowser },
      resources,
    },
    persistence: {
      storageClassName: storageClasses.rbd,
    },
    extraVolumes: mediaVolumes.map<Volume>(v => ({
      name: v,
      persistentVolumeClaim: {
        claimName: v,
      },
    })).concat([
      {
        name: 'media',
        persistentVolumeClaim: {
          claimName: 'media',
        },
      },
      {
        name: 'assets',
        configMap: {
          name: assets.metadata.name,
        },
      },
      {
        name: 'nfs',
        nfs: {
          server: '192.168.1.10',
          path: '/tank1/media/archive',
          readOnly: true,
        },
      },
    ]),
    extraVolumeMounts: mediaVolumes.map<VolumeMount>(v => ({
      name: v,
      mountPath: `/srv/${v}`,
    })).concat([
      {
        name: 'media',
        mountPath: '/srv',
      },
      {
        name: 'nfs',
        mountPath: '/srv/nfs',
      },
      {
        name: 'assets',
        mountPath: '/assets/branding/img/logo.svg',
        subPath: 'logo.svg',
        readOnly: true,
      },
      {
        name: 'assets',
        mountPath: '/assets/branding/img/icons/favicon.ico',
        subPath: 'favicon.ico',
        readOnly: true,
      },
    ]),
    ingress: { enabled: false },
    'oauth2-proxy': {
      enabled: true,
      resources,
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
        className: ingresses.theclusterIo,
        pathType: 'Prefix',
        hosts: [hosts.external],
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
}, { provider });

const service = chart.getResource('v1/Service', 'media/filebrowser');

const serviceOutput = service.metadata.name;
export { hosts, versions, serviceOutput as service }
