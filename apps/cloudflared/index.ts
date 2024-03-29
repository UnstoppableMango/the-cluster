import { RandomId } from '@pulumi/random';
import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { DaemonSet } from '@pulumi/kubernetes/apps/v1';
import * as cloudflare from '@pulumi/cloudflare';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { jsonStringify, yamlStringify } from '@unstoppablemango/thecluster';
import { stack, versions, accountId } from './config';

const ns = new Namespace('cloudflared', {
  metadata: { name: 'cloudflared' },
}, { provider });

const tunnelPassword = new RandomId('cloudflared-tunnel', {
  byteLength: 32,
});

const zone = cloudflare.getZonesOutput({
  filter: { accountId, name: 'unmango.net' },
}).apply(z => z.zones[0]);

const tunnel = new cloudflare.Tunnel(`${stack}-cloudflared`, {
  name: `${stack}-cloudflared`,
  accountId,
  secret: tunnelPassword.b64Std,
});

// Api Server ideas...

// const dnsRecord = new cloudflare.Record('apiserver-tunnel', {
//   name: config.require('dnsName'),
//   zoneId: zone.apply(x => x.id ?? ''),
//   type: 'CNAME',
//   value: tunnel.cname,
//   proxied: true,
// });

// Cloudflared service config for the Api Server
// hostname: config.require('dnsName'),
// service: pulumi.interpolate`tcp://kubernetes.default:6443`,

// const kubeRootCa = k8s.core.v1.ConfigMap.get('kube-root-ca.crt', 'kube-root-ca.crt');

// Container volume for kube CA
// {
//   name: 'ca',
//   configMap: {
//     name: kubeRootCa.metadata.name,
//     items: [{
//       key: 'ca.crt',
//       path: 'ca.crt',
//     }],
//   }
// }

const dnsRecord = new cloudflare.Record('cloudflared-tunnel', {
  name: 'plex.unmango.net',
  zoneId: zone.apply(x => x.id ?? ''),
  type: 'CNAME',
  value: tunnel.cname,
  proxied: true,
});

const credentialsSecret = new Secret('credentials.json', {
  metadata: {
    name: 'tunnel',
    namespace: ns.metadata.name,
  },
  stringData: {
    'credentials.json': jsonStringify({
      AccountTag: tunnel.accountId,
      TunnelId: tunnel.id,
      TunnelSecret: tunnel.secret,
    }),
  },
}, { provider });

const configMap = new ConfigMap('config.yaml', {
  metadata: {
    name: 'cloudflared-tunnel',
    namespace: ns.metadata.name,
  },
  data: {
    'config.yaml': yamlStringify({
      tunnel: tunnel.name,
      'credentials-file': '/etc/cloudflared/creds/credentials.json',
      metrics: '0.0.0.0:2000',
      'no-autoupdate': true,
      originRequest: {
        caPool: '/etc/cloudflared/ca/ca.crt',
        // noTLSVerify: true,
      },
      ingress: [
        {
          hostname: 'plex.unmango.net',
          service: 'http://192.168.1.70:32400',
        },
        {
          service: 'http_status:404',
        },
      ],
    }),
  },
}, { provider });

const daemonset = new DaemonSet('cloudflared-tunnel', {
  metadata: {
    name: 'cloudflared-tunnel',
    namespace: ns.metadata.name,
  },
  spec: {
    selector: {
      matchLabels: {
        app: 'cloudflared',
      },
    },
    template: {
      metadata: {
        labels: {
          app: 'cloudflared',
        },
      },
      spec: {
        priorityClassName: 'system-cluster-critical',
        containers: [{
          name: 'cloudflared-tunnel',
          image: `cloudflare/cloudflared:${versions.cloudflared}`,
          args: [
            'tunnel',
            '--config',
            '/etc/cloudflared/config/config.yaml',
            'run',
          ],
          livenessProbe: {
            httpGet: {
              path: '/ready',
              port: 2000,
            },
            failureThreshold: 1,
            initialDelaySeconds: 10,
            periodSeconds: 10,
          },
          volumeMounts: [
            {
              name: 'config',
              mountPath: '/etc/cloudflared/config',
              readOnly: true,
            },
            {
              name: 'creds',
              mountPath: '/etc/cloudflared/creds',
              readOnly: true,
            },
            {
              name: 'ca',
              mountPath: '/etc/cloudflared/ca',
              readOnly: true,
            },
          ],
        }],
        volumes: [
          {
            name: 'creds',
            secret: {
              secretName: credentialsSecret.metadata.name,
            },
          },
          {
            name: 'config',
            configMap: {
              name: configMap.metadata.name,
              items: [{
                key: 'config.yaml',
                path: 'config.yaml',
              }],
            },
          },
        ],
      },
    },
  },
}, { provider });
