import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as YAML from 'yaml';

const config = new pulumi.Config();

let provider: k8s.Provider | undefined = undefined;
if (config.getBoolean('useStackRef')) {
  const stackRef = new pulumi.StackReference(
    'UnstoppableMango/thecluster-pinkdiamond/prod',
  );

  provider = new k8s.Provider(pulumi.getStack(), {
    kubeconfig: stackRef.requireOutput('kubeconfig').apply(x => YAML.parse(x)).apply(x => {
      x.clusters[0].cluster.server = 'https://pd.thecluster.io:6444';
      return YAML.stringify(x);
    }),
  });
}

const ns = new k8s.core.v1.Namespace('metrics-server', {
  metadata: { name: 'metrics-server' },
}, { provider });

const chart = new k8s.helm.v3.Chart('metrics-server', {
  path: './',
  namespace: ns.metadata.name,
}, { provider });
