export interface ClusterCsiConfig {
  clusterID: string;
  monitors: string[];
}

export type CsiConfig = ClusterCsiConfig[];
