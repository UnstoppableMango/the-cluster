import * as cloudflare from '@pulumi/cloudflare';
import * as pihole from '@unmango/pulumi-pihole';
import { apps } from '@unstoppablemango/thecluster/cluster/from-config';
import { zone, fullSslHosts, lanDomains } from './config';

const ssl = new cloudflare.Ruleset('ssl', {
  name: 'THECLUSTER',
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
}, { provider: apps.pihole.provider }));
