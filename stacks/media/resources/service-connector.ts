import { Image } from '@pulumi/docker';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class ServiceConnector extends ComponentResource {

  private readonly getName = getNameResolver('service-connector', this.name);

  public readonly imageName = 'media-service-connector';
  public readonly image: Image;
  public readonly deployment?: kx.Deployment;

  constructor(private name: string, args: ServiceConnectorArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:service-connector', name, undefined, opts);

    this.image = new Image(this.getName(), {
      // Relative to dir pulumi command was run in
      build: './containers/service-connector',
      imageName: pulumi.output(args.version).apply(version => {
        return `harbor.int.unmango.net/library/${this.imageName}:${version}`;
      }),
      registry: {
        server: 'https://harbor.int.unmango.net',
        username: args.registryUsername,
        password: args.registryPassword,
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      containers: [{
        image: this.image.imageName,
        volumeMounts: pulumi.output(args.configClaims)
          .apply(dirs => dirs.map(x => ({
            name: x.metadata.name,
            mountPath: '/config',
          }))),
      }],
    });

    // this.deployment = new kx.Deployment(this.getName(), {
    //   metadata: { namespace: 'TODO' },
    //   spec: pb.asDeploymentSpec(),
    // });

    this.registerOutputs();
  }

}

export interface ServiceConnectorArgs {
  version: Input<string>;
  configClaims: Input<Input<kx.PersistentVolumeClaim>[]>;
  registryUsername: Input<string>;
  registryPassword: Input<string>;
}
