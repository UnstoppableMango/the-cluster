import { Config, output } from '@pulumi/pulumi';
import * as cf from '@pulumi/cloudflare';

const config = new Config();

export const suffix = config.get('suffix');

export const zone = cf.getZoneOutput({ name: config.require('zoneName') });
export const permissionGroups = cf.getApiTokenPermissionGroupsOutput();
