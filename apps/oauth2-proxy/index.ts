import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

const config = new pulumi.Config();
const cluster = pulumi.getStack();

const stackRef = new pulumi.StackReference(cluster, {
  name: `UnstoppableMango/thecluster-${cluster}/prod`,
});

const provider = new k8s.Provider(cluster, {
  kubeconfig: stackRef.requireOutput('kubeconfig'),
});

const ns = new k8s.core.v1.Namespace('oauth2-proxy', {
  metadata: { name: 'oath2-proxy' },
}, { provider });

const chart = new k8s.helm.v3.Chart('cloudflare-ingress', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'oauth2-proxy': {
    },
  },
}, { provider });
