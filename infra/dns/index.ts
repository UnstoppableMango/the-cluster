import * as pulumi from '@pulumi/pulumi';
import * as cloudflare from '@pulumi/cloudflare';
import * as pihole from '@unmango/pulumi-pihole';
import { suffix, zone, fullSslHosts, lanDomains } from './config';
import { provider as piholeProvider } from './apps/pihole';

function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

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

const records = lanDomains.map(d => new pihole.DnsRecord(d.name, {
  domain: d.name,
  ip: d.ip,
}, { provider: piholeProvider }));
