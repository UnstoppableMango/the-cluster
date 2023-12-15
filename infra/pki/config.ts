import { Config, getStack } from '@pulumi/pulumi';
import { ApiToken, getZoneOutput, getApiTokenPermissionGroupsOutput } from '@pulumi/cloudflare';
import { appendIf } from '@unmango/thecluster';

const config = new Config();
export const suffix = config.get('suffix');
export const zone = getZoneOutput({ name: config.require('zoneName') });
export const permissionGroups = getApiTokenPermissionGroupsOutput();
export const cluster = getStack();

export const apiToken = new ApiToken('cert-manager', {
  name: appendIf(`THECLUSTER-cert-manager-${cluster}`, suffix),
  policies: [
    {
      permissionGroups: permissionGroups.apply(g => [
        g.zone['Zone Read'],
        g.zone['DNS Write'],
      ]),
      resources: zone.apply(z => ({
        [`com.cloudflare.api.account.zone.${z.zoneId}`]: '*',
      })),
    },
  ],
});
