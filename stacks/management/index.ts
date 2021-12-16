import * as k8s from '@pulumi/kubernetes';
import * as rancher from '@pulumi/rancher2';
import { Heimdall } from './resources';

const project = new rancher.Project('management', {
  name: 'Management',
  clusterId: 'local',
});

const prometheusNamespace = new rancher.Namespace('prometheus', {
  name: 'prometheus',
  projectId: project.id,
});

const prometheusCrdsBaseUrl = 'https://raw.githubusercontent.com/prometheus-community/helm-charts/main/charts/kube-prometheus-stack/crds';

const prometheusCrds = new k8s.yaml.ConfigGroup('prometheus-crds', {
  files: [
    'crd-alertmanagerconfigs.yaml',
    'crd-alertmanagers.yaml',
    'crd-podmonitors.yaml',
    'crd-probes.yaml',
    // https://github.com/prometheus-operator/prometheus-operator/issues/4355
    // 'crd-prometheuses.yaml',
    'crd-prometheusrules.yaml',
    'crd-servicemonitors.yaml',
    'crd-thanosrulers.yaml',
  ].map(x => `${prometheusCrdsBaseUrl}/${x}`),
});

const prometheusRelease = new k8s.helm.v3.Release('prometheus', {
  name: 'prometheus',
  namespace: prometheusNamespace.name,
  chart: 'kube-prometheus-stack',
  repositoryOpts: {
    repo: 'https://prometheus-community.github.io/helm-charts',
  },
  atomic: true,
  cleanupOnFail: true,
  createNamespace: false,
  skipCrds: true,
  values: {
    namespaceOverride: prometheusNamespace.name,
    alertmanager: {
      ingress: {
        enabled: true,
        hosts: ['alerts.int.unmango.net'],
        pathType: 'ImplementationSpecific',
      },
      alertmanagerSpec: {
        storage: {
          volumeClaimTemplate: {
            spec: {
              storageClassName: 'longhorn',
              resources: {
                requests: { storage: '50Gi' },
              },
            },
          },
        },
        podAntiAffinity: 'soft',
        podAntiAffinityTopologyKey: 'host',
      },
    },
    grafana: {
      ingress: {
        enabled: true,
        hosts: ['metrics.int.unmango.net'],
      },
    },
    // prometheusOperator: {
    //   admissionWebhooks: {
    //     certManager: {
    //       enabled: true,
    //       issuerRef: {
    //         // TODO: Actually reference this
    //         name: 'letsencrypt-cqd120jq',
    //         kind: 'ClusterIssuer',
    //       },
    //     },
    //   },
    // },
    prometheus: {
      ingress: {
        enabled: true,
        hosts: ['prometheus.int.unmango.net'],
        pathType: 'ImplementationSpecific',
      },
      prometheusSpec: {
        storageSpec: {
          volumeClaimTemplate: {
            spec: {
              storageClassName: 'longhorn',
              resources: {
                requests: { storage: '50Gi' },
              },
            },
          },
        },
        podAntiAffinity: 'soft',
        podAntiAffinityTopologyKey: 'host',
      },
    },
  },
}, {
  dependsOn: prometheusCrds.ready,
});

const portainerNamespace = new rancher.Namespace('portainer', {
  name: 'portainer',
  projectId: project.id,
});

const portainerRelease = new k8s.helm.v3.Release('portainer', {
  name: 'portainer',
  chart: 'portainer',
  namespace: portainerNamespace.name,
  repositoryOpts: {
    repo: 'https://portainer.github.io/k8s',
  },
  values: {
    service: { type: 'ClusterIP' },
    ingress: {
      enabled: true,
      hosts: [{
        host: 'portainer.int.unmango.net',
        // Needs at least one array item, but keep the defaults on said item
        // https://github.com/portainer/k8s/blob/master/charts/portainer/templates/ingress.yaml#L34-L39
        paths: [{}],
      }],
    },
    persistence: {
      enabled: true,
      size: '5Gi',
      storageClass: 'longhorn',
    },
  },
});

const heimdall = new Heimdall('heimdall', {
  projectId: project.id,
  hostname: 'heimdall.int.unmango.net',
  titlebarText: 'Test',
});
