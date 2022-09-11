import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as helm from '@pulumi/kubernetes/helm/v3';
import * as random from '@pulumi/random';
import * as arc from '@pulumi/crds/actions/v1alpha1';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { matchBuilder } from '@unmango/shared/traefik';

const unstoppableMangoActionsNs = new k8s.core.v1.Namespace('unstoppablemango-actions', {
  metadata: {
    name: 'unstoppablemango-actions',
  },
});

const unmangoActionsNs = new k8s.core.v1.Namespace('unmango-actions', {
  metadata: {
    name: 'unmango-actions',
  },
});

const config = new pulumi.Config();
const unstoppableMangoConfig = config.requireObject<GithubEntity>('unstoppableMango');
// const unmangoConfig = config.requireObject<GithubEntity>('unmango');

const unstoppableMangoArc = createActionsRunnerController(
  unstoppableMangoActionsNs,
  unstoppableMangoConfig.github,
  'unstoppablemango-actions.thecluster.io',
  { type: 'user', user: 'UnstoppableMango' },
  ['the-cluster'],
);

// const unmangoArc = createActionsRunnerController(
//   unmangoActionsNs,
//   unmangoConfig.github,
//   'unmango-actions.thecluster.io',
//   { type: 'org', organization: 'unmango' },
// );

function createActionsRunnerController(
  namespace: k8s.core.v1.Namespace,
  config: GithubConfig,
  hostname: string,
  owner: Owner,
  repositories?: string[],
): {
  secret: k8s.core.v1.Secret;
  release: helm.Release;
  runnerSets: arc.RunnerSet[];
  autoScalers: arc.HorizontalRunnerAutoscaler[];
  ingressRoute: traefik.IngressRoute;
} {
  const prefix = (owner.type === 'org' ? owner.organization : owner.user).toLowerCase();
  const secret = new k8s.core.v1.Secret(`${prefix}-arc`, {
    metadata: {
      name: `${prefix}-arc`,
      namespace: namespace.metadata.name,
    },
    stringData: {
      github_app_id: config.actionsRunner.appId,
      github_app_installation_id: config.actionsRunner.installationId,
      github_app_private_key: config.actionsRunner.privateKey,
      github_webhook_secret_token: config.webhook.secretToken,
    },
  });

  const leaderElectionId = new random.RandomUuid(`${prefix}-leader-election`);

  const release = new helm.Release(`${prefix}-arc`, {
    name: `${prefix}-arc`,
    chart: 'actions-runner-controller',
    namespace: namespace.metadata.name,
    repositoryOpts: {
      repo: 'https://actions-runner-controller.github.io/actions-runner-controller',
    },
    values: {
      fullnameOverride: `${prefix}-arc`,
      replicaCount: 3,
      authSecret: {
        name: secret.metadata.name,
      },
      leaderElectionId: leaderElectionId.result,
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
        fullnameOverride: `${prefix}-arc-ghws`,
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

  const runnerSets: arc.RunnerSet[] = [];
  const autoScalers: arc.HorizontalRunnerAutoscaler[] = [];

  if (owner.type === 'org') {
    repositories = ['all'];
  }

  (repositories ?? []).forEach(repository => {
    const resourceName = owner.type === 'org' ? owner.organization : `${prefix}-${repository}`;
    const runnerPrefix = owner.type === 'org' ? owner.organization : repositories;
    const runnerName = `${runnerPrefix}-runner`;

    const pulumiMountName = `${runnerName}-pulumi`;

    const runnerSet = new arc.RunnerSet(resourceName, {
      metadata: {
        name: resourceName,
        namespace: namespace.metadata.name,
        annotations: {
          'cluster-autoscaler.kubernetes.io/safe-to-evict': 'true',
        },
      },
      spec: {
        organization: owner.type === 'org' ? owner.organization : undefined,
        repository: owner.type === 'user' ? `${owner.user}/${repository}` : undefined,
        ephemeral: false,
        selector: {
          matchLabels: {
            app: runnerName,
          },
        },
        serviceName: runnerName,
        volumeClaimTemplates: [{
          metadata: {
            name: runnerName,
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
        }, {
          metadata: {
            name: pulumiMountName,
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
              app: runnerName,
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
                name: runnerName,
                mountPath: '/runner/cache',
              }, {
                // https://github.com/pulumi/setup-pulumi#setup-github-action
                // The pulumi action will use the tool cache behind the scenes,
                // but we should still be able to benefit from caching plugins.
                // We explicitly *don't* want to cache all of .pulumi, because
                // the pulumi action will delete bin on every run, and credentials
                // are stored in a json file in that dir.
                name: pulumiMountName,
                mountPath: '/home/runner/.pulumi/plugins',
              }],
              env: [{
                name: 'NPM_CONFIG_CACHE',
                value: '/runner/cache/npm',
              }, {
                name: 'RUNNER_TOOL_CACHE',
                value: '/runner/cache/tool',
              }],
            }],
          },
        },
      },
    }, {
      dependsOn: [release],
    });

    const runnerSetName = pulumi.output(runnerSet.metadata).apply(x => x?.name ?? '');
    const runnerKind = pulumi.output(runnerSet.kind).apply(x => x ?? '');

    const autoScaler = new arc.HorizontalRunnerAutoscaler(resourceName, {
      metadata: {
        name: resourceName,
        namespace: namespace.metadata.name,
      },
      spec: {
        scaleTargetRef: {
          name: runnerSetName,
          kind: runnerKind,
        },
        minReplicas: 1,
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

  const ingressRoute = new traefik.IngressRoute(`${prefix}-arc`, {
    metadata: {
      name: `${prefix}-arc`,
      namespace: namespace.metadata.name,
    },
    spec: {
      entryPoints: ['websecure'],
      routes: [{
        kind: 'Rule',
        match: matchBuilder().host(hostname).build(),
        services: [{
          // Retrieved by running and seeing what it was created as
          name: `${prefix}-arc-ghws`,
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

type Owner =
  | { type: 'user', user: string }
  | { type: 'org', organization: string };

interface GithubEntity {
  github: GithubConfig;
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
