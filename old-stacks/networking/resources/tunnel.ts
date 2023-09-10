import * as pulumi from '@pulumi/pulumi';
import * as cf from '@pulumi/cloudflare';
import * as kx from '@pulumi/kubernetesx';
import * as random from '@pulumi/random';
import * as YAML from 'yaml';

export class Tunnel extends pulumi.ComponentResource {

  private readonly password!: pulumi.Output<random.RandomId>;
  private readonly secret!: pulumi.Output<kx.Secret>;
  private readonly dnsRecords!: pulumi.Output<cf.Record>[];
  private readonly config!: pulumi.Output<kx.ConfigMap>;
  private readonly deployment!: pulumi.Output<kx.Deployment>;
  private readonly tunnel!: pulumi.Output<cf.ArgoTunnel>;

  constructor(name: string, args: TunnelArgs, opts?: pulumi.ComponentResourceOptions) {
    super('unmango:resources:tunnel', name, args, opts);

    const certMountPath = '/etc/cloudflared/cert.json';
    const cfArgs = pulumi.output(args.cloudflare);

    const password = new random.RandomId(name, {
      byteLength: 35,
    }, { parent: this });
    
    const tunnel = new cf.ArgoTunnel(name, {
      name, // TODO: Does this need more flexibility?
      accountId: cfArgs.accountId,
      secret: password.b64Std,
    }, { parent: this });

    const zone = cfArgs.zone
      .apply(zone => cf.getZones({
        filter: {
          name: zone,
        },
      }))
      .apply(x => x.zones[0]);

    const dns = pulumi
      .output(args.dnsRecords)
      .apply(records => records.map((record) => new cf.Record(`${name}-${record}`, {
        name: record,
        type: 'CNAME',
        zoneId: zone.apply((x) => x.id ?? ''),
        value: pulumi.interpolate`${tunnel.id}.cfargotunnel.com`,
        proxied: true,
      }, { parent: this })));

    const secret = new kx.Secret(name, {
      metadata: { namespace: args.namespace },
      stringData: {
        'cert.json': pulumi
          .all([tunnel.accountId, tunnel.id, tunnel.name, tunnel.secret])
          .apply(([a, i, n, s]) =>
            JSON.stringify({
              AccountTag: a,
              TunnelID: i,
              TunnelName: n,
              TunnelSecret: s,
            }),
          ),
      },
    }, { parent: this });

    const config = new kx.ConfigMap(name, {
      metadata: { namespace: args.namespace },
      data: {
        'config.yml': pulumi
          .output({
            tunnel: tunnel.id,
            'credentials-file': certMountPath,
            ingress: [
              ...args.ingresses,
              { service: 'http_status:404' },
            ],
          })
          .apply(YAML.stringify),
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      containers: [{
        image: 'cloudflare/cloudflared:2021.12.1',
        args: ['--config', '/etc/cloudflared/config.yml', '--no-autoupdate', 'tunnel', 'run'],
        volumeMounts: [
          secret.mount(certMountPath, 'cert.json'),
          config.mount('/etc/cloudflared/config.yml', 'config.yml'),
        ],
      }],
    });

    const deployment = new kx.Deployment(name, {
      metadata: { namespace: args.namespace },
      spec: pb.asDeploymentSpec(),
    }, { parent: this });

    this.registerOutputs({
      password,
      tunnel,
      dnsRecords: dns,
      secret,
      config,
      deployment,
    });
  }

}

export interface TunnelArgs {
  cloudflare: pulumi.Input<{
    accountId: pulumi.Input<string>;
    zone: pulumi.Input<string>;
  }>;
  dnsRecords: pulumi.Input<string>[];
  ingresses: pulumi.Input<{
    hostname: pulumi.Input<string>;
    service: pulumi.Input<string>;
  }>[];
  namespace?: pulumi.Input<string>;
}
