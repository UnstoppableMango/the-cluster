import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as helm from '@pulumi/kubernetes/helm/v3';
import * as arc from '@pulumi/crds/actions/v1alpha1';
import { Namespace, Project } from '@pulumi/rancher2';

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
    authSecret: {
      name: actionsRunnerControllerSecret.metadata.name,
    },
    topologySpreadConstraints: [{
      maxSkew: 1,
      topologyKey: 'host',
      whenUnsatisfiable: 'ScheduleAnyway',
    }],
  },
});

const theclusterRunnerDeployment = new arc.RunnerDeployment('thecluster', {
  metadata: {
    name: 'thecluster',
    namespace: githubNs.name,
    annotations: {
      'cluster-autoscaler.kubernetes.io/safe-to-evict': 'true',
    },
  },
  spec: {
    template: {
      spec: {
        repository: 'UnstoppableMango/the-cluster',
      },
    },
  },
}, {
  dependsOn: [actionsRunnerControllerRelease],
});

const theclusterRunnerName = pulumi
  .output(theclusterRunnerDeployment.metadata)
  .apply(x => x?.name ?? '');

const theclusterRunnerAutoScaler = new arc.HorizontalRunnerAutoscaler('thecluster', {
  metadata: {
    name: 'thecluster',
    namespace: githubNs.name,
  },
  spec: {
    scaleTargetRef: {
      name: theclusterRunnerName,
    },
    minReplicas: 1,
    maxReplicas: 10,
    metrics: [{
      type: 'PercentageRunnersBusy',
      scaleUpThreshold: '0.75',
      scaleDownThreshold: '0.3',
      scaleUpFactor: '1.4',
      scaleDownFactor: '0.7',
    }],
  },
}, {
  dependsOn: [actionsRunnerControllerRelease],
});

interface GithubConfig {
  actionsRunner: {
    appId: string;
    clientSecret: string;
    installationId: string;
    privateKey: string;
  }
}
