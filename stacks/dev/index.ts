import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as helm from '@pulumi/kubernetes/helm/v3';
import * as arc from '@pulumi/crds/actions/v1alpha1';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { Namespace, Project } from '@pulumi/rancher2';
import { matchBuilder } from '@unmango/shared/traefik';

const config = new pulumi.Config();

const project = new Project('dev', {
  name: 'Dev',
  clusterId: 'local',
});

const githubNs = new Namespace('github', {
  name: 'github',
  projectId: project.id,
});

const githubConfig = config.requireObject<GithubConfig>('github');

const actionsRunnerControllerSecret = new k8s.core.v1.Secret('actions-runner-controller', {
  metadata: {
    name: 'actions-runner-controller',
    namespace: githubNs.name,
  },
  stringData: {
    github_app_id: githubConfig.actionsRunner.appId,
    github_app_installation_id: githubConfig.actionsRunner.installationId,
    github_app_private_key: githubConfig.actionsRunner.privateKey,
    github_webhook_secret_token: githubConfig.webhook.secretToken,
  },
});

const actionsRunnerControllerRelease = new helm.Release('actions-runner-controller', {
  name: 'actions-runner-controller',
  chart: 'actions-runner-controller',
  namespace: githubNs.name,
  repositoryOpts: {
    repo: 'https://actions-runner-controller.github.io/actions-runner-controller',
  },
  values: {
    replicaCount: 3,
    authSecret: {
      name: actionsRunnerControllerSecret.metadata.name,
    },
    topologySpreadConstraints: [{
      maxSkew: 1,
      topologyKey: 'host',
      whenUnsatisfiable: 'ScheduleAnyway',
      labelSelector: {
        matchLabels: {
          'app.kubernetes.io/instance': 'actions-runner-controller',
        },
      },
    }],
    githubWebhookServer: {
      enabled: true,
      secret: {
        name: actionsRunnerControllerSecret.metadata.name,
      },
      service: {
        type: 'ClusterIP',
      },
      topologySpreadConstraints: [{
        maxSkew: 1,
        topologyKey: 'host',
        whenUnsatisfiable: 'ScheduleAnyway',
        labelSelector: {
          matchLabels: {
            'app.kubernetes.io/instance': 'actions-runner-controller',
          },
        },
      }],
    },
  },
});

// Test Change

const runnerCacheDir = '/runner/cache';
const theclusterRunnerSet = new arc.RunnerSet('the-cluster', {
  metadata: {
    name: 'the-cluster',
    namespace: githubNs.name,
    annotations: {
      'cluster-autoscaler.kubernetes.io/safe-to-evict': 'true',
    },
  },
  spec: {
    repository: 'UnstoppableMango/the-cluster',
    ephemeral: false,
    selector: {
      matchLabels: {
        app: 'the-cluster-runner',
      },
    },
    serviceName: 'the-cluster-runner',
    volumeClaimTemplates: [{
      metadata: {
        name: 'the-cluster-runner',
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        storageClassName: 'longhorn',
        resources: {
          requests: {
            storage: '10Gi',
          },
        },
      },
    }],
    template: {
      metadata: {
        labels: {
          app: 'the-cluster-runner',
        },
      },
      spec: {
        securityContext: {
          // https://github.com/actions-runner-controller/actions-runner-controller/blob/cc25dd7926909a6c2bd300440016559d695453c3/runner/Dockerfile#L63
          fsGroup: 1000,
        },
        containers: [{
          name: 'runner',
          volumeMounts: [{
            name: 'the-cluster-runner',
            mountPath: runnerCacheDir,
          }],
          env: [{
            name: 'THECLUSTER_CACHE',
            value: runnerCacheDir,
          }],
        }],
      },
    },
  },
}, {
  dependsOn: [actionsRunnerControllerRelease],
});

const theclusterRunnerName = pulumi
  .output(theclusterRunnerSet.metadata)
  .apply(x => x?.name ?? '');

const theclusterRunnerKind = pulumi
  .output(theclusterRunnerSet.kind)
  .apply(x => x ?? '');

const theclusterRunnerAutoScaler = new arc.HorizontalRunnerAutoscaler('the-cluster', {
  metadata: {
    name: 'the-cluster',
    namespace: githubNs.name,
  },
  spec: {
    scaleTargetRef: {
      name: theclusterRunnerName,
      kind: theclusterRunnerKind,
    },
    minReplicas: 0,
    maxReplicas: 10,
    scaleUpTriggers: [{
      // Scales up on workflow_job "queued"
      // Scales down on workflow_job "completed"
      githubEvent: {},
      duration: '30m',
    }],
  },
}, {
  dependsOn: [actionsRunnerControllerRelease],
});

const mediaRoutes = new traefik.IngressRoute('actions-runner-controller', {
  metadata: {
    name: 'actions-runner-controller',
    namespace: githubNs.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: matchBuilder()
        .host('actions-runner-controller.thecluster.io')
        .build(),
      services: [{
        // Retrieved by running and seeing what it was created as
        name: 'actions-runner-controller-github-webhook-server',
        port: 80,
      }],
    }],
  },
});

interface GithubConfig {
  actionsRunner: {
    appId: string;
    clientSecret: string;
    installationId: string;
    privateKey: string;
  };
  webhook: {
    secretToken: string;
  };
}
