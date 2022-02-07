import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as helm from '@pulumi/kubernetes/helm/v3';
import * as arc from '@pulumi/crds/actions/v1alpha1';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { matchBuilder } from '@unmango/shared/traefik';

const unstoppableMangoActionsNs = new k8s.core.v1.Namespace('unstoppablemango-actions', {
  metadata: {
    name: 'unstoppablemango-actions',
  },
});

const config = new pulumi.Config();
const githubConfig = config.requireObject<GithubConfig>('github');

const unstoppableMangoArc = createActionsRunnerController(
  unstoppableMangoActionsNs,
  githubConfig,
  'unstoppablemango-actions.thecluster.io',
  ['the-cluster'],
  'UnstoppableMango',
);

function createActionsRunnerController(
  namespace: k8s.core.v1.Namespace,
  config: GithubConfig,
  hostname: string,
  repositories: string[],
  user?: string,
): {
  secret: k8s.core.v1.Secret;
  release: helm.Release;
  runnerSets: arc.RunnerSet[];
  autoScalers: arc.HorizontalRunnerAutoscaler[];
  ingressRoute: traefik.IngressRoute;
} {
  const secret = new k8s.core.v1.Secret('actions-runner-controller', {
    metadata: {
      name: 'actions-runner-controller',
      namespace: namespace.metadata.name,
    },
    stringData: {
      github_app_id: config.actionsRunner.appId,
      github_app_installation_id: config.actionsRunner.installationId,
      github_app_private_key: config.actionsRunner.privateKey,
      github_webhook_secret_token: config.webhook.secretToken,
    },
  });

  const release = new helm.Release('actions-runner-controller', {
    name: 'actions-runner-controller',
    chart: 'actions-runner-controller',
    namespace: namespace.metadata.name,
    repositoryOpts: {
      repo: 'https://actions-runner-controller.github.io/actions-runner-controller',
    },
    values: {
      replicaCount: 3,
      authSecret: {
        name: secret.metadata.name,
      },
      scope: {
        watchNamespace: namespace.metadata.name,
        singleNamespace: true,
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
          name: secret.metadata.name,
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

  const runnerCacheDir = '/runner/cache';

  const runnerSets: arc.RunnerSet[] = [];
  const autoScalers: arc.HorizontalRunnerAutoscaler[] = [];

  repositories.forEach(repository => {
    const runnerSet = new arc.RunnerSet(repository, {
      metadata: {
        name: repository,
        namespace: namespace.metadata.name,
        annotations: {
          'cluster-autoscaler.kubernetes.io/safe-to-evict': 'true',
        },
      },
      spec: {
        organization: user === undefined ? repository : undefined,
        repository: user === undefined ? undefined : `${user}/${repository}`,
        ephemeral: false,
        selector: {
          matchLabels: {
            app: `${repository}-runner`,
          },
        },
        serviceName: `${repository}-runner`,
        volumeClaimTemplates: [{
          metadata: {
            name: `${repository}-runner`,
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
              app: `${repository}-runner`,
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
                name: `${repository}-runner`,
                mountPath: runnerCacheDir,
              }],
              env: [{
                name: 'RUNNER_CACHE',
                value: runnerCacheDir,
              }],
            }],
          },
        },
      },
    }, {
      dependsOn: [release],
    });

    const runnerName = pulumi.output(runnerSet.metadata).apply(x => x?.name ?? '');
    const runnerKind = pulumi.output(runnerSet.kind).apply(x => x ?? '');

    const autoScaler = new arc.HorizontalRunnerAutoscaler(repository, {
      metadata: {
        name: repository,
        namespace: namespace.metadata.name,
      },
      spec: {
        scaleTargetRef: {
          name: runnerName,
          kind: runnerKind,
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
      dependsOn: [release],
    });

    runnerSets.push(runnerSet);
    autoScalers.push(autoScaler);
  });

  const ingressRoute = new traefik.IngressRoute('actions-runner-controller', {
    metadata: {
      name: 'actions-runner-controller',
      namespace: namespace.metadata.name,
    },
    spec: {
      entryPoints: ['websecure'],
      routes: [{
        kind: 'Rule',
        match: matchBuilder().host(hostname).build(),
        services: [{
          // Retrieved by running and seeing what it was created as
          name: 'actions-runner-controller-github-webhook-server',
          port: 80,
        }],
      }],
    },
  }, {
    dependsOn: [release],
  });

  return {
    secret,
    autoScalers,
    ingressRoute,
    release,
    runnerSets,
  };
}

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
