import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';

const ns = new Namespace('kube-prometheus-stack', {
  metadata: { name: 'kube-prometheus-stack' },
});

const release = new Chart('stack', {
  namespace: ns.metadata.name,
  chart: 'kube-prometheus-stack',
  repositoryOpts: {
    repo: 'https://prometheus-community.github.io/helm-charts',
  },
  version: '66.3.1',
  values: {
    alertmanager: {
      service: {
        type: 'LoadBalancer',
      },
      alertManagerSpec: {
        volumeClaimTemplate: {
          spec: {
            storageClassName: 'unsafe-rbd',
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: '100Gi'
              },
            },
          },
        },
      },
    },
    grafana: {
      replicas: 2,
      service: {
        type: 'LoadBalancer',
      },
    },
    prometheus: {
      service: {
        type: 'LoadBalancer',
      },
      prometheusSpec: {
        replicas: 2,
        resources: {
          requests: {
            cpu: '500m',
            memory: '400Mi',
          },
          limits: {
            cpu: '1',
            memory: '4Gi',
          },
        },
        storageSpec: {
          volumeClaimTemplate: {
            spec: {
              storageClassName: 'unsafe-rbd',
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '100Gi'
                },
              },
            },
          },
        },
      },
    },
    prometheusOperator: {
      // https://github.com/prometheus-community/helm-charts/issues/2742
      tls: { enabled: false },
      admissionWebhooks: {
        enabled: false,
      },
    },
  },
});
