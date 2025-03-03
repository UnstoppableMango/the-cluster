import { Chart } from "@pulumi/kubernetes/helm/v4";

const chart = new Chart('shulker', {
  chart: 'shulker-operator',
  namespace: 'shulker-system', // created in infra/gaming
  repositoryOpts: {
    repo: 'https://jeremylvln.github.io/Shulker/helm-charts',
  },
  // https://github.com/jeremylvln/Shulker/blob/main/kube/helm/values.yaml
  values: {},
});
