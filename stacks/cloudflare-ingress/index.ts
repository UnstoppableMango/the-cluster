import * as pulumi from "@pulumi/pulumi";
import * as k8s from '@pulumi/kubernetes';

const cfConfig = new pulumi.Config('cloudflare');

const ns = new k8s.core.v1.Namespace('cloudflare-ingress', {
    metadata: { name: 'cloudflare-ingress' },
});

const chart = new k8s.helm.v3.Chart('cloudflare-ingress', {
    path: './',
    namespace: ns.metadata.name,
    values: {
      cloudflare: {
        // TODO: Create a new token specifically for this
        apiToken: cfConfig.requireSecret('apiToken'),
        accountId: cfConfig.require('accountId'),
        tunnelName: 'rosequartz-ingress',
      }
    },
});
