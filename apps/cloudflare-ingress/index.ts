import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cf from '@pulumi/cloudflare';
import { Versions } from './types';

function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');
const cluster = config.require('cluster');
export const ingressClass = 'cloudflare-ingress';

const stackRef = new pulumi.StackReference(cluster, {
  name: `UnstoppableMango/thecluster-${cluster}/prod`,
});

const provider = new k8s.Provider(cluster, {
  kubeconfig: stackRef.requireOutput('kubeconfig'),
});

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
      image: {
        repository: config.require('imageName'),
        tag: versions.image,
      },
      securityContext: {
        allowPrivilegeEscalation: false,
      },
    },
  },
}, { provider });
