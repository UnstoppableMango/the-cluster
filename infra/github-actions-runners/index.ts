import * as fs from 'node:fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { apps, provider } from '@unmango/thecluster/cluster/from-stack';
import { github, privateKey, scaleSets } from './config';
import { ConfigMap } from '@pulumi/kubernetes/core/v1';
import { core } from '@pulumi/kubernetes/types/input';

export const namespaces: pulumi.Output<string>[] = [];

for (const set of scaleSets) {
  const ns = new k8s.core.v1.Namespace(`${set.name}-actions-runners`, {
    metadata: { name: `${set.name}-actions-runners` },
  }, { provider });

  namespaces.push(ns.metadata.name);

  const authSecret = new k8s.core.v1.Secret(set.name, {
    metadata: {
      name: set.name,
      namespace: ns.metadata.name,
    },
    stringData: {
      github_app_id: github.appId,
      github_app_installation_id: github.installationId,
      github_app_private_key: privateKey,
    },
  }, { provider });

  const hooks = new ConfigMap(`${set.name}-hooks`, {
    metadata: {
      name: 'hooks',
      namespace: ns.metadata.name,
    },
    data: {
      'clean-pvs.sh': fs.readFile('clean-pvs.sh', 'utf-8'),
    },
  }, { provider });

  const chart = new k8s.helm.v3.Chart(set.name, {
    path: './',
    namespace: ns.metadata.name,
    values: {
      // https://github.com/actions/actions-runner-controller/blob/master/charts/gha-runner-scale-set/values.yaml
      'gha-runner-scale-set': {
        githubConfigUrl: set.githubUrl,
        // This produces a warning about `cannot overwrite table [...]` but its actually intended
        // https://github.com/actions/actions-runner-controller/blob/3e4201ac5f6c6d172a19b580154eaf5abf24a2ca/charts/gha-runner-scale-set/templates/githubsecret.yaml#L1
        githubConfigSecret: authSecret.metadata.name,
        controllerServiceAccount: {
          name: apps.actionsRunnerController.serviceAccount,
          namespace: apps.actionsRunnerController.namespace,
        },
        minRunners: set.minRunners,
        maxRunners: set.maxRunners,
        runnerScaleSetName: set.name,
        containerMode: {
          type: 'kubernetes',
        },
        // https://github.com/actions/actions-runner-controller/blob/3e4201ac5f6c6d172a19b580154eaf5abf24a2ca/charts/gha-runner-scale-set/values.yaml#L162-L189
        template: <core.v1.Pod>{
          spec: {
            securityContext: {
              runAsUser: 1001,
              runAsGroup: 1001,
              fsGroup: 1001,
            },
            topologySpreadConstraints: [{
              maxSkew: 1,
              topologyKey: 'kubernetes.io/hostname',
              whenUnsatisfiable: 'ScheduleAnyway',
              labelSelector: {
                matchLabels: {
                  'actions.github.com/scale-set-name': set.name,
                },
              },
            }],
            containers: [{
              name: 'runner',
              image: 'ghcr.io/actions/actions-runner:latest',
              command: ['/home/runner/run.sh'],
              env: [
                { name: 'ACTIONS_RUNNER_REQUIRE_JOB_CONTAINER', value: 'true' },
                { name: 'ACTIONS_RUNNER_HOOK_JOB_COMPLETED', value: '/opt/runner/hooks/clean-pvs.sh' },
              ],
              volumeMounts: [
                ...set.volumeMounts ?? [],
                {
                  name: 'hooks',
                  mountPath: '/opt/runner/hooks',
                  readOnly: true,
                },
              ],
            }],
            volumes: [
              ...set.volumes ?? [],
              {
                name: 'work',
                ephemeral: {
                  volumeClaimTemplate: {
                    spec: {
                      // Explicit opt-out of dynamic provisioning
                      storageClassName: '',
                      accessModes: ['ReadWriteOnce'],
                      selector: {
                        matchLabels: {
                          'thecluster.io/role': 'actions-runner',
                        },
                      },
                      resources: {
                        requests: {
                          storage: '100Gi',
                        },
                      },
                    },
                  },
                },
              },
              {
                name: 'hooks',
                configMap: {
                  name: hooks.metadata.name,
                },
              },
            ],
          },
        },
      },
    },
    transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
      opts.dependsOn = [authSecret];
    }],
  }, { provider });
}
