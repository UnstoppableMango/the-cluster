export interface ClusterCsiConfig {
  clusterID: string;
  monitors: string[];
}

export type CsiConfig = ClusterCsiConfig[];

export interface Rbd {
  userId: string;
  userKey: string;
}

export interface CephFS {
  adminId: string;
  adminKey: string;
}
