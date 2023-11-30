import * as pulumi from '@pulumi/pulumi';

export interface Versions {
  clusterapi: string;
  proxmox: string;
  sidero: string;
  cabpt: string;
  cacppt: string;
  certManager: string;
  pulumiOperator: string;
  externalSnapshotter: string;
}

const config = new pulumi.Config();
export const enabled = config.requireObject<(keyof Versions)[]>('enabled');
export const versions = config.requireObject<Versions>('versions');
