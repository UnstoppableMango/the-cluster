import { Config, getStack } from '@pulumi/pulumi';
import * as cf from '@pulumi/cloudflare';

export interface Versions {
  certManagerCsi: string;
  csiNodeDriverRegistrar: string;
}

const config = new Config();
export const suffix = config.get('suffix');
export const zone = cf.getZoneOutput({ name: config.require('zoneName') });
export const permissionGroups = cf.getApiTokenPermissionGroupsOutput();
export const cluster = getStack();
export const versions = config.requireObject<Versions>('versions');
