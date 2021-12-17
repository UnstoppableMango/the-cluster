import * as pulumi from '@pulumi/pulumi';
import * as cf from '@pulumi/cloudflare';
import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as random from '@pulumi/random';
import * as YAML from 'yaml';

export class Tunnel extends pulumi.ComponentResource {

  private readonly password!: pulumi.Output<random.RandomId>;
  private readonly secret!: pulumi.Output<kx.Secret>;
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

    const dns = new cf.Record(name, {
      name: args.recordName,
      type: 'CNAME',
      zoneId: zone.apply((x) => x.id ?? ''),
      value: pulumi.interpolate`${tunnel.id}.cfargotunnel.com`,
      proxied: true,
      ttl: 60,
    }, { parent: this });

    const secret = new kx.Secret(name, {
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
      data: {
        'config.yml': pulumi
          .all([tunnel.id, args.hostname, args.service])
          .apply(([tunnelId, hostname, service]) => YAML.stringify({
            tunnel: tunnelId,
            'credentials-file': certMountPath,
            ingress: [
              { hostname, service },
              { service: 'http_status:404' },
            ],
          })),
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      containers: [{
        image: 'cloudflare/cloudflared:2021.12.0',
        volumeMounts: [
          secret.mount(certMountPath, 'cert.json'),
          config.mount('/etc/cloudflared/config.yml', 'config.yml'),
        ],
      }],
    });

    const deployment = new kx.Deployment(name, {
      spec: pb.asDeploymentSpec(),
    }, { parent: this });

    this.registerOutputs({
      password,
      tunnel,
      dns,
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
  hostname: pulumi.Input<string>;
  recordName: pulumi.Input<string>;
  service: pulumi.Input<string>;
}
