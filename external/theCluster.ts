import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { Catalogs, getCatalogs } from './catalogs';

const getGetter = (name: string) => (stack: string) => {
  return new pulumi.StackReference(`UnstoppableMango/${name}/${stack}`);
};

export const getTheClusterRef = getGetter('the-cluster');
export const getRancherRef = getGetter('rancher');

export interface GetTheClusterArgs {
  theClusterRef: pulumi.StackReference;
  rancherRef: pulumi.StackReference;
}

export interface TheCluster {
  rancherProvider: rancher.Provider;
  k8sProvider: k8s.Provider;
  theCluster: rancher.Cluster;
  defaultProject: rancher.Project;
  systemProject: rancher.Project;
  catalogs: Catalogs;
}

export function getTheCluster(arg: GetTheClusterArgs | string): TheCluster {
  const { theClusterRef, rancherRef } = resolveArgs(arg);

  const rancherProvider = getRancherProvider(rancherRef);
  const k8sProvider = new k8s.Provider('rancher', {
    kubeconfig: theClusterRef.requireOutput('kubeconfig'),
  });

  const clusterId = theClusterRef.requireOutput('clusterId');

  const getProject = getProjectGetter(theClusterRef, rancherProvider);

  return {
    rancherProvider,
    k8sProvider,

    theCluster: rancher.Cluster.get(
      'the-cluster',
      clusterId,
      undefined,
      { provider: rancherProvider },
    ),
    defaultProject: getProject('default'),
    systemProject: getProject('system'),
    catalogs: getCatalogs(clusterId, theClusterRef, rancherProvider),
  };
}

const getProjectGetter = (ref: pulumi.StackReference, provider: pulumi.ProviderResource) => (name: string) => rancher.Project.get(
  name,
  ref.requireOutput(`${name}ProjectId`),
  undefined,
  { provider },
);

const getRancherProvider = (ref: pulumi.StackReference) => new rancher.Provider('rancher', {
  apiUrl: ref.requireOutput('apiUrl'),
  tokenKey: ref.requireOutput('tokenKey'),
  insecure: true,
});

const resolveArgs = (arg: GetTheClusterArgs | string): GetTheClusterArgs => {
  let theClusterRef: pulumi.StackReference;
  let rancherRef: pulumi.StackReference;

  if (typeof arg === 'string') {
    theClusterRef = getTheClusterRef(arg);
    rancherRef = getRancherRef(arg);
  } else {
    theClusterRef = arg.theClusterRef;
    rancherRef = arg.rancherRef;
  }

  return { theClusterRef, rancherRef };
};
