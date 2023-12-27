import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { apps, provider, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { github, privateKey, scaleSets } from './config';
import { PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';

export const namespaces: pulumi.Output<string>[] = [];

for (const set of scaleSets) {
  const ns = new k8s.core.v1.Namespace(`${set.name}-actions-runners`, {
    metadata: { name: `${set.name}-actions-runners` },
  }, { provider });

  namespaces.push(ns.metadata.name);

  const cachePvc = new PersistentVolumeClaim(`${set.name}-cache`, {
    metadata: {
      name: `${set.name}-cache`,
      namespace: ns.metadata.name,
      labels: {
        app: set.name,
        'thecluster.io/role': 'actions-runner',
      },
    },
    spec: {
      accessModes: ['ReadWriteMany'],
      storageClassName: storageClasses.cephfs,
      resources: {
        requests: {
          storage: '50Gi',
        },
      },
    },
  }, { provider });

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
        template: set.podTemplate,
        containerMode: {
          type: 'kubernetes',
          kubernetesModeWorkVolumeClaim: {
            accessModes: ['ReadWriteOnce'],
            storageClassName: storageClasses.rbd,
            resources: {
              requests: {
                storage: '10Gi',
              },
            },
          },
        },
      },
    },
    transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
      opts.dependsOn = [authSecret];
    }],
  }, { provider });
}
