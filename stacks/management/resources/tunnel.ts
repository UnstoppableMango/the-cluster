import * as pulumi from '@pulumi/pulumi';
import * as cf from '@pulumi/cloudflare';
import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as random from '@pulumi/random';
import * as YAML from 'yaml';

export class Tunnel extends pulumi.ComponentResource {

  private readonly password: pulumi.Output<random.RandomId>;
  private readonly secret: pulumi.Output<kx.Secret>;
  private readonly config: pulumi.Output<kx.ConfigMap>;
  private readonly deployment: pulumi.Output<kx.Deployment>;
  private readonly tunnel: pulumi.Output<cf.ArgoTunnel>;

  constructor(name: string, args: TunnelArgs, opts?: pulumi.ComponentResourceOptions) {
    super('unmango:resources:tunnel', name, args, opts);

    const certMountPath = '/etc/cloudflared/cert.json';

    const password = new random.RandomId(name, {
      byteLength: 35,
    }, { parent: this });
    
    const tunnel = new cf.ArgoTunnel(name, {
      name, // TODO: Does this need more flexibility?
      accountId: pulumi.output(args.cloudflare).apply(x => x.accountId),
      secret: password.b64Std,
    });

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
        'config.yml': pulumi.output(tunnel).apply((t) => YAML.stringify({
          tunnel: t.id,
          'credentials-file': certMountPath,
          ingress: [
            {
              hostname: args.hostname,
              service: args.service,
            },
            {
              service: 'http_status:404',
            },
          ],
        })),
      },
    });

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
    });

    this.registerOutputs({
      password,
      tunnel,
      secret,
      config,
      deployment,
    });
  }

}

export interface TunnelArgs {
  cloudflare: pulumi.Input<{
    accountId: pulumi.Input<string>;
  }>;
  hostname: pulumi.Input<string>;
  service: pulumi.Input<string>;
}
