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
      'cloudflare-tunnel-ingress-controller': {
        cloudflare: {
          // TODO: Create a new token specifically for this
          apiToken: cfConfig.requireSecret('apiToken'),
          accountId: cfConfig.require('accountId'),
          tunnelName: 'rosequartz-ingress',
        },
        image: {
          repository: 'ghcr.io/unstoppablemango/cloudflare-tunnel-ingress-controller',
          tag: 'sha-c92febc@sha256:7e4c9374891a1bd4058c09865d9b431779510de39c6ebdb8b13045f4935c87ed',
        },
      },
    },
});
