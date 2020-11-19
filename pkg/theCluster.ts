import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';

const getStack = (name: string, stack: string) => `UnstoppableMango/${name}/${stack}`;

export const getTheClusterRef = (stack: string): string => getStack('the-cluster', stack);
export const getRancherRef = (stack: string): string => getStack('rancher', stack);

export interface GetTheClusterArgs {
  theClusterRef: pulumi.StackReference;
  rancherRef: pulumi.StackReference;
}

export interface TheCluster {
  rancherProvider: rancher.Provider;
  k8sProvider: k8s.Provider;
  theCluster: rancher.Cluster;
  libraryCatalog: rancher.Catalog;
  bitnamiCatalog: rancher.Catalog;
  traefikCatalog: rancher.CatalogV2;
  defaultProject: rancher.Project;
  systemProject: rancher.Project;
}

export function getTheCluster({ theClusterRef, rancherRef }: GetTheClusterArgs): TheCluster {
  const rancherProvider = new rancher.Provider('rancher', {
    apiUrl: rancherRef.requireOutput('apiUrl'),
    tokenKey: rancherRef.requireOutput('tokenKey'),
    insecure: true,
  });

  const k8sProvider = new k8s.Provider('rancher', {
    kubeconfig: rancherRef.requireOutput('theClusterKubeConfig'),
  });

  return {
    rancherProvider,
    k8sProvider,

    theCluster: rancher.Cluster.get(
      'the-cluster',
      rancherRef.requireOutput('theClusterId'),
      undefined,
      { provider: rancherProvider },
    ),
    libraryCatalog: rancher.Catalog.get(
      'library',
      theClusterRef.requireOutput('libraryCatalogId'),
      undefined,
      { provider: rancherProvider },
    ),
    bitnamiCatalog: rancher.Catalog.get(
      'bitnami',
      theClusterRef.requireOutput('bitnamiCatalogId'),
      undefined,
      { provider: rancherProvider },
    ),
    traefikCatalog: rancher.CatalogV2.get(
      'traefik',
      theClusterRef.requireOutput('traefikCatalogId'),
      { clusterId: rancherRef.requireOutput('theClusterId') },
      { provider: rancherProvider },
    ),
    defaultProject: rancher.Project.get(
      'default',
      theClusterRef.requireOutput('defaultProjectId'),
      undefined,
      { provider: rancherProvider },
    ),
    systemProject: rancher.Project.get(
      'system',
      theClusterRef.requireOutput('systemProjectId'),
      undefined,
      { provider: rancherProvider },
    ),
  };
}
