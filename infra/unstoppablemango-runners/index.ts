import { Namespace, Secret } from "@pulumi/kubernetes/core/v1";
import { Chart } from "@pulumi/kubernetes/helm/v4";
import { Config } from "@pulumi/pulumi";

const config = new Config();

const ns = new Namespace('unstoppablemango-runners', {
  metadata: { name: 'unstoppablemango-runners' },
});

const secret = new Secret('github-config', {
  metadata: { namespace: ns.metadata.name },
  stringData: {
    github_app_id: '169402', // THECLUSTER Bot
    github_app_installation_id: '22901293', // UnstoppableMango
    github_app_private_key: config.requireSecret('private-key'),
  },
});

const chart = new Chart('lang-runner-scale-set', {
  name: 'lang-runners', // INSTALLATION_NAME, used for runs-on in workflows
  namespace: ns.metadata.name,
  chart: 'oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set',
  values: {
    githubConfigUrl: 'https://github.com/UnstoppableMango/lang',
    githubConfigSecret: secret.metadata.name,
    containerMode: {
      type: 'kubernetes',
      kubernetesModeWorkVolumeClaim: {
        accessModes: ['ReadWriteOnce'],
        storageClassName: 'unsafe-rbd',
        resources: {
          requests: {
            // LLVM is chonky
            storage: '100Gi',
          },
        },
      },
    },
    template: {
      spec: {
        securityContext: {
          fsGroup: 1001,
        },
        containers: [{
          name: 'runner',
          image: 'ghcr.io/actions/actions-runner:latest',
          command: ['/home/runner/run.sh'],
        }],
      },
    },
  },
});
