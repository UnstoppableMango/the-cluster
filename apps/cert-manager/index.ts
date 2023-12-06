import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cf from '@pulumi/cloudflare';
import * as cm from '@pulumi/crds/certmanager/v1';
import { appendIf, CertManagerOutputs } from '@unmango/thecluster';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { permissionGroups, suffix, zone } from './config';

const ns = new k8s.core.v1.Namespace('cert-manager', {
  metadata: { name: 'cert-manager' },
}, { provider });

// Use a release because the cert-manager helm chart uses hooks
const release = new k8s.helm.v3.Release('cert-manager', {
  chart: './',
  name: 'cert-manager',
  namespace: ns.metadata.name,
  createNamespace: false,
  atomic: true,
  dependencyUpdate: true,
  lint: true,
  values: {
    // https://github.com/cert-manager/cert-manager/blob/master/deploy/charts/cert-manager/README.template.md#configuration
    'cert-manager': {
      installCRDs: false, // TODO: Enable, still switching over
      podDisruptionBudget: {
        enabled: true,
        minAvailable: 1,
      },
      // Redundant, but QoL safeguard
      // https://github.com/cert-manager/cert-manager/blob/4209de23716562f44f3f7295b1f162bbb69f6ccd/deploy/charts/cert-manager/values.yaml#L98-L101C14
      namespace: ns.metadata.name,
      enableCertificateOwnerRef: true,
    },
    // https://github.com/cert-manager/trust-manager/blob/main/deploy/charts/trust-manager/README.md#values
    'trust-manager': {
      secretTargets: {
        enabled: true,
        // Consider switching to `authorizedSecrets` so we're not granting
        // cert-manager access to every secret in the cluster
        authorizedSecretsAll: true,
        // authorizedSecrets: [],
      },
      crds: {
        enabled: true,
      },
      // Redundant, but QoL safeguard
      // https://github.com/cert-manager/trust-manager/blob/01bd331abb8ee071025e2b8989930a2eb3b1d8e9/deploy/charts/trust-manager/values.yaml#L4-L7
      namespace: ns.metadata.name,
    },
    // https://github.com/cert-manager/csi-driver/tree/main/deploy/charts/csi-driver#values
    'cert-manager-csi-driver': {},
  },
}, { provider });

const apiToken = new cf.ApiToken('cert-manager', {
  name: appendIf('THECLUSTER-cert-manager', suffix),
  policies: [
    {
      permissionGroups: permissionGroups.apply(g => [
        g.zone['Zone Read'],
        g.zone['DNS Write'],
      ]),
      resources: zone.apply(z => ({
        [`com.cloudflare.api.account.zone.${z.zoneId}`]: '*',
      })),
    },
  ],
});

const selfSignedIssuer = new cm.ClusterIssuer('selfsigned', {
  metadata: { name: 'selfsigned' },
  spec: {
    selfSigned: {},
  },
}, { provider });

const tokenSecret = new k8s.core.v1.Secret('cloudflare-api-token', {
  metadata: {
    name: 'cloudflare-api-token',
    namespace: ns.metadata.name,
  },
  stringData: {
    'api-token': apiToken.value,
  },
}, { provider });

const cloudflareStagingIssuer = new cm.ClusterIssuer('le-stage-cloudflare', {
  metadata: { name: 'le-stage-cloudflare' },
  spec: {
    acme: {
      privateKeySecretRef: {
        name: 'cloudflare-staging-account-key',
      },
      server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
      solvers: [{
        dns01: {
          cloudflare: {
            apiTokenSecretRef: {
              name: tokenSecret.metadata.name,
              key: 'api-token',
            },
          },
        },
      }],
    },
  },
}, { provider });

const cloudflareIssuer = new cm.ClusterIssuer('le-cloudflare', {
  metadata: { name: 'le-cloudflare' },
  spec: {
    acme: {
      privateKeySecretRef: {
        name: 'cloudflare-account-key',
      },
      server: 'https://acme-v02.api.letsencrypt.org/directory',
      solvers: [{
        dns01: {
          cloudflare: {
            apiTokenSecretRef: {
              name: tokenSecret.metadata.name,
              key: 'api-token',
            },
          },
        },
      }],
    },
  },
}, { provider });

export const staging = pulumi.output(cloudflareStagingIssuer.metadata).apply(x => x?.name ?? '');
export const prod = pulumi.output(cloudflareIssuer.metadata).apply(x => x?.name ?? '');

export const clusterIssuers: CertManagerOutputs['clusterIssuers'] = {
  staging: pulumi.output(cloudflareStagingIssuer.metadata).apply(x => x?.name ?? ''),
  prod: pulumi.output(cloudflareIssuer.metadata).apply(x => x?.name ?? ''),
  selfSigned: pulumi.output(selfSignedIssuer.metadata).apply(x => x?.name ?? ''),
}
