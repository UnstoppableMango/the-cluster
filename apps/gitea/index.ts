import { RandomPassword } from '@pulumi/random';
import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { interpolate } from '@pulumi/pulumi';
import { username, versions } from './config';

const ns = new Namespace('gitea', {
  metadata: { name: 'gitea' },
});

const password = new RandomPassword('admin', { length: 48 });

const secret = new Secret('admin', {
  metadata: { namespace: ns.metadata.name },
  stringData: {
    username,
    password: password.result,
    // email,
  },
});

// https://gitea.com/gitea/helm-chart
const chart = new Chart('gitea', {
  chart: 'oci://registry-1.docker.io/giteacharts/gitea',
  namespace: ns.metadata.name,
  values: {
    gitea: {
      admin: {
        existingSecret: secret.metadata.name,
      },
      config: {},
    },
    image: {
      tag: interpolate`${versions.gitea}-rootless`,
      rootless: true,
    },
    service: {
      http: {
        type: 'ClusterIP',
        externalTrafficPolicy: 'Local',
      },
      ssh: {
        type: 'LoadBalancer',
        externalTrafficPolicy: 'Local',
      },
    },
    ingress: {
      enabled: true,
      hosts: [{ host: 'gitea.thecluster.io' }],
    },
    persistence: {
      enabled: true,
      storageClass: 'ssd-rbd',
      size: '50Gi',
    },
    resource: {
      limits: {
        cpu: '8000m',
        memory: '1Gi',
      },
      requests: {
        cpu: '250m',
        memory: '512Mi',
      },
    },
  },
});
