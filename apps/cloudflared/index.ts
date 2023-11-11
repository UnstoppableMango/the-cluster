import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import * as random from '@pulumi/random';
import * as YAML from 'yaml';

interface Versions {
  cloudflared: string;
}

const stack = pulumi.getStack();
const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');

const ns = k8s.core.v1.Namespace.get('kube-system', 'kube-system');
const apiServer = k8s.core.v1.Service.get('apiserver', 'default/kubernetes');

const tunnelPassword = new random.RandomPassword('apiserver-tunnel', {
  length: 32, // At least 32 bytes. A 32 character UTF-16 string should be more than enough.
});

const tunnel = new cloudflare.Tunnel(`${stack}-apiserver`, {
  name: `${stack}-apiserver`,
  accountId: config.require('accountId'),
  secret: tunnelPassword.result.apply(x => Buffer.from(x).toString('base64')),
  configSrc: 'local',
});

const credentialsSecret = new k8s.core.v1.Secret('credentials.json', {
  metadata: {
    name: 'apiserver-tunnel',
    namespace: ns.metadata.name,
  },
  stringData: {
    'credentials.json': JSON.stringify({
      AccountTag: tunnel.accountId,
      TunnelId: tunnel.id,
      TunnelSecret: tunnel.secret,
    }),
  },
});

const configMap = new k8s.core.v1.ConfigMap('config.yaml', {
  metadata: {
    name: 'apiserver-tunnel',
    namespace: ns.metadata.name,
  },
  data: {
    'config.yaml': YAML.stringify({
      tunnel: `${stack}-apiserver`,
      'credentials-file': '/etc/cloudflared/creds/credentials.json',
      metrics: '0.0.0.0:2000',
      'no-autoupdate': true,
      ingress: [
        {
          hostname: config.require('dnsName'),
          service: pulumi.interpolate`https://${apiServer.spec.clusterIP}:443`,
        },
        {
          service: 'http_status:404',
        },
      ],
    }),
  },
});

const daemonset = new k8s.apps.v1.DaemonSet('apiserver-tunnel', {
  metadata: {
    name: 'apiserver-tunnel',
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
          name: 'apiserver-tunnel',
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
});
