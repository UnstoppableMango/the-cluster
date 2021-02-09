import { Image } from '@pulumi/docker';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class ServiceConnector extends ComponentResource {

  private readonly getName = getNameResolver('service-connector', this.name);

  public readonly image: Image;
  public readonly deployment: kx.Deployment;

  constructor(private name: string, args: ServiceConnectorArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:service-connector', name, undefined, opts);

    const pb = new kx.PodBuilder({
      containers: [{
        image: pulumi.all([args.version]).apply(([version]) => {
          return `unstoppablemango/media-service-connector:${version}`;
        }),
        volumeMounts: pulumi.output(args.configClaims)
          .apply(dirs => dirs.map(x => ({
            name: x.metadata.name,
            mountPath: 'config',
          }))),
      }],
    });

    this.registerOutputs();
  }

}

export interface ServiceConnectorArgs {
  configClaims: Input<Input<kx.PersistentVolumeClaim>[]>;
  version: Input<string>;
}
