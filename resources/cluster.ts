import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';

export interface CreateClusterArgs {
  provider?: rancher.Provider;
}

export function createCluster(args?: CreateClusterArgs): rancher.Cluster {
  const config = new pulumi.Config();
  const opts = (args ?? {}) as pulumi.CustomResourceOptions;

  if (config.getBoolean('useLocalCluster')) {
    return rancher.Cluster.get('local', 'local', undefined, opts);
  }

  if (config.getBoolean('useMinikube')) {
    return new rancher.Cluster('minikube', {
      name: 'minikube',
      driver: 'imported',
    }, opts);
  }

  return new rancher.Cluster('the-cluster', {
    name: 'the-cluster',
    rkeConfig: {
      kubernetesVersion: 'v1.19.4-rancher1-1',
      services: {
        kubelet: {
          // Hopefully should ensure consistency across nodes
          extraArgs: { 'root-dir': '/var/lib/kubelet' },
          // Above is apparently not enough to provide consistency across nodes
          extraBinds: ['/var/lib/kubelet:/var/lib/kubelet:shared,z'],
        },
      },
    },
  }, opts);
}
