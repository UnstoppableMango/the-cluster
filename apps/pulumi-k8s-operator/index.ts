import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

interface Versions {
  customImage: string;
}

const config = new pulumi.Config();
const verions = config.requireObject<Versions>('versions');

const ns = new k8s.core.v1.Namespace('pulumi-kubernetes-operator', {
  metadata: { name: 'pulumi-kubernetes-operator' },
});

const release = new k8s.helm.v3.Release('pulumi-kubernetes-operator', {
  chart: './',
  name: 'pulumi-kubernetes-operator',
  namespace: ns.metadata.name,
  createNamespace: false,
  atomic: true,
  dependencyUpdate: true,
  lint: true,
  skipCrds: true,
  values: {
    image: {
      repository: 'ghcr.io/unstoppablemango/pulumi-kubernetes-operator-nodejs',
      tag: verions.customImage,
    },
  },
});
