import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cf from '@pulumi/cloudflare';

const config = new pulumi.Config();
const accountId = config.require('accountId');
const zoneId = config.require('zoneId');

const all = cf.getApiTokenPermissionGroups();
const apiToken = new cf.ApiToken('cloudflare-ingress', {
  name: 'THECLUSTER-cloudflare-ingress',
  policies: [
    {
      permissionGroups: all.then(x => [
        x.zone['Zone Read'],
        x.zone['DNS Write'],
        x.account['Argo Tunnel Write'],
      ]),
      resources: {
        [`com.cloudflare.api.account.${accountId}`]: '*',
        [`com.cloudflare.api.account.zone.${zoneId}`]: '*',
      },
    },
  ],
});

const ns = new k8s.core.v1.Namespace('cloudflare-ingress', {
    metadata: { name: 'cloudflare-ingress' },
});

const chart = new k8s.helm.v3.Chart('cloudflare-ingress', {
    path: './',
    namespace: ns.metadata.name,
    values: {
      'cloudflare-tunnel-ingress-controller': {
        cloudflare: {
          apiToken: apiToken.value,
          accountId: accountId,
          tunnelName: 'rosequartz-ingress',
        },
        image: {
          repository: 'ghcr.io/unstoppablemango/cloudflare-tunnel-ingress-controller',
          tag: 'sha-c92febc@sha256:7e4c9374891a1bd4058c09865d9b431779510de39c6ebdb8b13045f4935c87ed',
        },
      },
    },
});
