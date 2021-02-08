import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class FlareSolverr extends ComponentResource {

  private readonly getName = getNameResolver('flare-solverr', this.name);

  public readonly deployment: k8s.apps.v1.Deployment;
  public readonly service: k8s.core.v1.Service;

  constructor(private name: string, args: FlareSolverrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:flare-solverr', name, undefined, opts);

    this.deployment = new k8s.apps.v1.Deployment(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        selector: {
          matchLabels: {
            app: this.getName(),
          },
        },
        template: {
          metadata: {
            labels: {
              app: this.getName(),
            },
          },
          spec: {
            containers: [{
              name: this.getName(),
              image: pulumi.output(args.version).apply(version => {
                return `ghcr.io/flaresolverr/flaresolverr:${version}`;
              }),
              env: [{
                name: 'LOG_LEVEL',
                value: 'debug',
              }],
              ports: [{
                name: 'http',
                containerPort: 8191,
                hostPort: 8191,
              }],
            }],
          },
        },
      },
    }, { parent: this });

    this.service = new k8s.core.v1.Service(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        type: 'ClusterIP',
        selector: this.deployment.spec.selector.matchLabels,
        ports: [{ name: 'http', port: 8191, targetPort: 8191 }],
      },
    }, { parent: this });

    this.registerOutputs();
  }
}

export interface FlareSolverrArgs {
  namespace: Input<string>;
  version: Input<string>;
}
