import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

const config = new pulumi.Config();
const zoneId: string = '22f1d42ba0fbe4f924905e1c6597055c';

const primaryCname = new cloudflare.Record('man.thecluster.io', {
  name: 'man',
  zoneId: zoneId,
  value: config.requireSecret('publicIp'),
  type: 'A',
  proxied: true,
});

const zoneSettings = new cloudflare.ZoneSettingsOverride('man.thecluster.io', {
  zoneId: zoneId,
  settings: {
    ssl: 'full',
    alwaysUseHttps: 'on',
  },
});

export const hostname = primaryCname.hostname
