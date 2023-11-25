import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { GitHub } from './types';

function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

const config = new pulumi.Config();
const cluster = pulumi.getStack();
const github = config.requireObject<GitHub>('github');

const stackRef = new pulumi.StackReference(cluster, {
  name: `UnstoppableMango/thecluster-${cluster}/prod`,
});

const cfingRef = new pulumi.StackReference('cloudflare-ingress', {
  name: `UnstoppableMango/thecluster-cloudflare-ingress/${cluster}`,
});

const provider = new k8s.Provider(cluster, {
  kubeconfig: stackRef.requireOutput('kubeconfig'),
});

const ns = new k8s.core.v1.Namespace('oauth2-proxy', {
  metadata: { name: 'oauth2-proxy' },
}, { provider });

const chart = new k8s.helm.v3.Chart('github', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'oauth2-proxy': {
      replicaCount: 2,
      config: {
        clientID: github.clientId,
        clientSecret: github.clientSecret,
      },
      extraEnv: [
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'github' },
      ],
      ingress: {
        enabled: true,
        className: cfingRef.requireOutput('ingressClass'),
        pathType: 'Prefix',
        hosts: config.requireObject<string[]>('hosts'),
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
  
          // * Ingress .status.loadBalancer field was not updated with a hostname/IP address.
          // for more information about this error, see https://pulumi.io/xdv72s
          // https://github.com/pulumi/pulumi-kubernetes/issues/1812
          // https://github.com/pulumi/pulumi-kubernetes/issues/1810
          'pulumi.com/skipAwait': 'true',
        },
      },
    },
  },
}, { provider });
