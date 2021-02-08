import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class Inlest extends ComponentResource {

  private readonly getName = getNameResolver('inlets', this.name);

  public readonly deployment: kx.Deployment;

  constructor(private name: string, args: InletsArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:inlets', name, undefined, opts);

    const pv = new kx.PodBuilder({
      containers: [{
        image: pulumi.output(args.version).apply(version => {
          return `inlets/inlets:${version}`;
        }),
      }],
    });

    this.registerOutputs();
  }
}

export interface InletsArgs {
  version: Input<string>;
}
