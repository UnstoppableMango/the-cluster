import { Config, getStack } from '@pulumi/pulumi';
import { getZoneOutput, getApiTokenPermissionGroupsOutput } from '@pulumi/cloudflare';

const config = new Config();
export const suffix = config.get('suffix');
export const zone = getZoneOutput({ name: config.require('zoneName') });
export const permissionGroups = getApiTokenPermissionGroupsOutput();
export const cluster = getStack();
