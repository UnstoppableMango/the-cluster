import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const config = new pulumi.Config();

let provider: k8s.Provider | undefined = undefined;
if (config.get('useStackRef')) {
  const stackRef = new pulumi.StackReference(
    'UnstoppableMango/thecluster-pinkdiamond/prod',
  );
  
  provider = new k8s.Provider(pulumi.getStack(), {
    kubeconfig: stackRef.requireOutput('kubeconfig'),
  });
}

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
  skipCrds: true,
}, { provider });
