import * as pulumi from "@pulumi/pulumi";
import * as k8s from '@pulumi/kubernetes';

const config = new pulumi.Config();
const hostname = config.require('hostname');

const fqdn = `${hostname}.thecluster.io`;
const url = `https://${fqdn}:5556`;

const ns = new k8s.core.v1.Namespace('dex', {
  metadata: { name: 'dex' },
});

const chart = new k8s.helm.v3.Chart('dex', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    dex: {
      config: {
        issuer: url,
        storage: { type: 'memory' },
        connectors: [{
          type: 'github',
          id: 'github',
          name: 'GitHub',
          config: {
            clienID: config.require('clientId'),
            clientSecret: config.requireSecret('clientSecret'),
            redirectURI: `${url}/callback`,
          },
        }],
      },
      ingress: {
        enabled: true,
        className: 'cloudflare-tunnel',
        hosts: [{
          host: fqdn,
          paths: [{
            path: '/',
            pathType: 'Prefix',
          }],
        }],
      },
    },
  },
});
