import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

const config = new pulumi.Config();
const zoneId: string = '22f1d42ba0fbe4f924905e1c6597055c';

const primaryDns = new cloudflare.Record('primaryDns', {
  name: config.require('primaryDnsName'),
  zoneId: zoneId,
  value: config.requireSecret('publicIp'),
  type: 'A',
  proxied: false, // TODO: Figure out proxy issues
});

// This rule probably isn't doing anything with the proxy turned off
const rule = new cloudflare.Ruleset('ssl', {
  name: pulumi.interpolate`${primaryDns.hostname} SSL`,
  description: pulumi.interpolate`Set SSL to a value that works for ${primaryDns.hostname}`,
  kind: 'zone',
  phase: 'http_config_settings',
  zoneId: zoneId,
  rules: [
    {
      expression: pulumi.interpolate`(http.host eq "${primaryDns.hostname}")`,
      action: 'set_config',
      actionParameters: {
        ssl: 'full',
      }
    }
  ]
}, { deleteBeforeReplace: true });

export const hostname = primaryDns.hostname
