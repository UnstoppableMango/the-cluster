import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';

interface Versions {
  cloudflared: string;
}

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');

const daemonset = new k8s.apps.v1.DaemonSet('apiserver-tunnel', {
  metadata: {
    name: 'apiserver-tunnel',
    namespace: 'kube-system',
  },
  spec: {
    selector: {},
    template: {
      metadata: {},
      spec: {
        priorityClassName: 'system-cluster-critical',
        containers: [{
          name: 'apiserver-tunnel',
          image: `cloudflare/cloudflared:${versions.cloudflared}`,
          args: [
            'tunnel',
            // TODO: Config
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
          },
        ],
      },
    },
  },
});
