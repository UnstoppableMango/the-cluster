import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';

const config = new pulumi.Config();

// TODO: Tunnel
const publicEndpoint = new cloudflare.Record('pd.thecluster.io', {
  name: 'pd.thecluster.io',
  type: 'A',
  zoneId: config.require('zoneId'),
  proxied: false,
  value: config.requireSecret('publicIp'),
});

const ns = new k8s.core.v1.Namespace('pink-diamond', {
  metadata: { name: 'pink-diamond' },
});

const manifests = new k8s.kustomize.Directory('manifests', {
  directory: './manifests',
}, {
  dependsOn: [publicEndpoint, ns],
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});
