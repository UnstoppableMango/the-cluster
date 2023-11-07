import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

interface Versions {
  customImage: string;
}

const config = new pulumi.Config();
const verions = config.requireObject<Versions>('versions');

const ns = new k8s.core.v1.Namespace('pulumi-operator', {
  metadata: { name: 'pulumi-operator' },
});

const chart = new k8s.helm.v3.Chart('pulumi-operator', {
  path: './',
  namespace: ns.metadata.name,
  skipCRDRendering: true,
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'Deployment') return;
    const container = obj.spec.template.spec.containers[0];
    container.image = `ghcr.io/unstoppablemango/pulumi-kubernetes-operator-nodejs:${verions.customImage}`;
  }],
});
