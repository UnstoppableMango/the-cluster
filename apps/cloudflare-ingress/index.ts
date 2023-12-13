import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cf from '@pulumi/cloudflare';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { appendIf } from '@unmango/thecluster';

const config = new pulumi.Config();
export const ingressClass = 'cloudflare-ingress';

const zone = cf.getZoneOutput({ name: config.require('zoneName') });
const all = cf.getApiTokenPermissionGroups();
const apiToken = new cf.ApiToken('cloudflare-ingress', {
  name: appendIf('THECLUSTER-cloudflare-ingress', config.get('suffix')),
  policies: [
    {
      permissionGroups: all.then(x => [
        x.zone['Zone Read'],
        x.zone['DNS Write'],
        x.account['Argo Tunnel Write'],
      ]),
      resources: pulumi.output(zone).apply(z => ({
        [`com.cloudflare.api.account.${z.accountId}`]: '*',
        [`com.cloudflare.api.account.zone.${z.zoneId}`]: '*',
      })),
    },
  ],
});

const ns = new k8s.core.v1.Namespace('cloudflare-ingress', {
  metadata: { name: 'cloudflare-ingress' },
}, { provider });

const chart = new k8s.helm.v3.Chart('cloudflare-ingress', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'cloudflare-tunnel-ingress-controller': {
      cloudflare: {
        apiToken: apiToken.value,
        accountId: zone.accountId,
        tunnelName: appendIf('rosequartz-ingress', config.get('suffix')),
      },
      ingressClass: {
        name: ingressClass,
        isDefaultClass: true,
      },
      securityContext: {
        allowPrivilegeEscalation: false,
      },
    },
  },
}, { provider });
