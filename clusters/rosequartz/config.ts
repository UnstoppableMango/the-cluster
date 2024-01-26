export type Nodes = Record<string, {
  hostname?: string,
  installDisk?: string
}>;

export interface Cluster {
  controlplanes?: Nodes,
  workers?: Nodes,
}

export interface Versions {
  k8s: string,
  talos: string,
  ksca: string,
}
