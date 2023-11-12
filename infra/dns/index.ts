import * as pulumi from '@pulumi/pulumi';
import * as cloudflare from '@pulumi/cloudflare';

function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

const config = new pulumi.Config();
const suffix = config.get('suffix');
const fullSslHosts = config.requireObject<string[]>('fullSslHosts');

const zone = cloudflare.getZonesOutput({
  filter: {
    accountId: config.require('accountId'),
    name: 'thecluster.io',
  },
}).apply(z => z.zones[0]);

export const ssl = new cloudflare.Ruleset('ssl', {
  name: appendIf('THECLUSTER', suffix),
  description: `SSL rules for THECLUSTER`,
  kind: 'zone',
  zoneId: zone.apply(x => x.id ?? ''),
  phase: 'http_config_settings',
  rules: [{
    action: 'set_config',
    actionParameters: {
      ssl: 'full',
    },
    expression: fullSslHosts.map(x => `(http.host eq "${x}")`).join(' or '),
  }],
});
