export interface Versions {
  k8s: string,
  talos: string,
  ksca: string,
}

export interface Node {
  hostname?: string;
  installDisk: string;
}
