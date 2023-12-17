import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { github, privateKey, versions } from './config';

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

const webhookSecretToken = new random.RandomId('webhook-secret', {
  byteLength: 16,
}).hex;

const chart = new k8s.helm.v3.Chart('actions-runner-controller', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/actions/actions-runner-controller/blob/master/charts/gha-runner-scale-set-controller/values.yaml
    'gha-runner-scale-set-controller': {
      replicaCount: 2,
      image: {
        repository: 'ghcr.io/actions/gha-runner-scale-set-controller',
        tag: versions.scaleSetController,
      },
      securityContext: {
        capabilities: { drop: ['ALL'] },
        readOnlyRootFilesystem: true,
        runAsNonRoot: true,
        runAsUser: 1001,
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
      metrics: {
        controllerManagerAddr: ':8080',
        listenerAddr: ':8080',
        listenerEndpoint: '/metrics',
      },
      flags: {
        // logLevel: '',
        logFormat: 'text', // `text` or `json`
        updateStrategy: 'eventual', // `immediate` or `eventual`
      },
    },
  },
}, { provider });

export const namespace = ns.metadata.name;
export const serviceAccount = chart.getResource(
  'v1/ServiceAccount',
  'actions-runner-system/actions-runner-controller-gha-rs-controller')
  .metadata.name;

export const webhookToken = pulumi.secret(webhookSecretToken);
const authSecretName = authSecret.metadata.name;
export { authSecretName as authSecret };
