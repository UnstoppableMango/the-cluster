export interface Versions {
  k8s: string,
  talos: string,
  ksca: string,
}

export interface ControlPlaneConfig {
  endpoint: string;
  machineCount: number;
  port: number;
}
