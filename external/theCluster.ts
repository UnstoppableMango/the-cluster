import * as rancher from '@pulumi/rancher2';

export interface TheCluster {
  cluster: rancher.Cluster;
}
