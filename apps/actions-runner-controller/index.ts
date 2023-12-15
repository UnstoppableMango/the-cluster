import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { ingresses, provider } from '@unmango/thecluster/cluster/from-stack';
import { github, hosts, privateKey, versions } from './config';

const ns = new k8s.core.v1.Namespace('actions-runner-system', {
  metadata: { name: 'actions-runner-system' },
}, { provider });

const authSecret = new k8s.core.v1.Secret('github-auth', {
  metadata: {
    name: 'github-auth',
    namespace: ns.metadata.name,
  },
  stringData: {
    github_app_id: github.appId,
    github_app_installation_id: github.installationId,
    github_app_private_key: privateKey,
  },
}, { provider });

export const webhookSecretToken = new random.RandomId('webhook-secret', {
  byteLength: 16,
}).hex;

const webhookSecret = new k8s.core.v1.Secret('webhook-server', {
  metadata: {
    name: 'webhook-server',
    namespace: ns.metadata.name,
  },
  stringData: {
    github_webhook_secret_token: webhookSecretToken,
  },
}, { provider });

const actionsMetricsSecret = new k8s.core.v1.Secret('actions-metrics', {
  metadata: {
    name: 'actions-metrics',
    namespace: ns.metadata.name,
  },
  stringData: {
    github_webhook_secret_token: webhookSecretToken,
  },
}, { provider });

const scaleSetSecret = new k8s.core.v1.Secret('scale-set', {
  metadata: {
    name: 'scale-set',
    namespace: ns.metadata.name,
  },
  stringData: {
    github_token: '', // TODO: Can we auth another way?
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('actions-runner-controller', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/actions/actions-runner-controller/blob/master/charts/actions-runner-controller/README.md#values
    'actions-runner-controller': {
      replicaCount: 2,
      webhookPort: 9443,
      syncPeriod: '1m',
      // logLevel: '',
      logFormat: 'text', // `text` or `json`
      authSecret: {
        name: authSecret.metadata.name,
      },
      image: {
        repository: 'summerwind/actions-runner-controller',
        tag: versions.actionsRunnerController,
        actionsRunnerRepositoryAndTag: `summerwind/actions-runner:${versions.actionsRunner}`,
        dindSidecarRepositoryAndTag: `docker:${versions.dind}`,
      },
      metrics: {
        port: 8443,
        proxy: {
          image: {
            repository: 'quay.io/brancz/kube-rbac-proxy',
            tag: versions.rbacProxy,
          },
        },
      },
      service: {
        type: 'ClusterIP',
        port: 443,
      },
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
      certManagerEnabled: true,
      runner: {
        statusUpdateHook: {
          enabled: true,
        },
      },
      githubWebhookServer: {
        enabled: true,
        // logLevel: '',
        logFormat: 'text', // `text` or `json`
        replicaCount: 2,
        useRunnerGroupsVisibility: true,
        secret: {
          enabled: true,
          name: webhookSecret.metadata.name,
        },
        service: {
          type: 'ClusterIP',
        },
        ingress: {
          enabled: true,
          annotations: {
            'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
            'pulumi.com/skipAwait': 'true',
          },
          hosts: [{
            host: hosts.webhook.external,
            paths: [{
              path: '/',
              pathType: 'Prefix',
            }],
          }],
          ingressClassName: ingresses.cloudflare,
        },
        resources: {
          limits: {
            cpu: '100m',
            memory: '128Mi',
          },
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
        },
      },
      actionsMetricsServer: {
        enabled: true,
        port: 8443,
        secret: {
          enabled: true,
          name: actionsMetricsSecret.metadata.name,
        },
        service: {
          type: 'ClusterIP',
        },
        ingress: {
          enabled: true,
          annotations: {
            'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
            'pulumi.com/skipAwait': 'true',
          },
          hosts: [{
            host: hosts.metrics.external,
            pathType: 'Prefix',
            paths: [{
              path: '/',
              pathType: 'Prefix',
            }],
          }],
          ingressClassName: ingresses.cloudflare,
        },
        resources: {
          limits: {
            cpu: '100m',
            memory: '128Mi',
          },
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
        },
        proxy: {
          image: {
            repository: 'quay.io/brancz/kube-rbac-proxy',
            tag: versions.rbacProxy,
          },
        },
      },
    },
    'gha-runner-scale-set': {
      githubConfigUrl: 'https://github.com/UnstoppableMango/the-cluster',
      githubConfigSecret: {
        name: scaleSetSecret.metadata.name, // TODO: Verify this key exists
      },
    },
  },
}, { provider });
