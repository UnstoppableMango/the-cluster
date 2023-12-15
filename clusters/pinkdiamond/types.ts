export interface Versions {
  k8s: string,
  talos: string,
  ksca: string,
}

export interface Node {
  ip: string;
  hostname?: string;
  installDisk: string;
  qemu?: boolean;
}
