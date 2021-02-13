import { Image } from '@pulumi/docker';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class ServiceConnector extends ComponentResource {

  private readonly getName = getNameResolver('service-connector', this.name);

  public readonly imageName = 'media-service-connector';
  public readonly image: Image;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;

  constructor(private name: string, args: ServiceConnectorArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:service-connector', name, undefined, opts);

    this.image = new Image(this.getName(), {
      // Relative to dir pulumi command was run in
      build: {
        context: './containers',
        dockerfile: './containers/service-connector/Dockerfile',
      },
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
        image: this.image.baseImageName,
        ports: { http: 80 },
        livenessProbe: {
          httpGet: {
            path: '/healthz',
            port: 80,
          },
        },
      }],
    });

    this.deployment = new kx.Deployment(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: pb.asDeploymentSpec(),
    });

    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
    });

    this.registerOutputs();
  }

}

export interface ServiceConnectorArgs {
  namespace: Input<string>;
  version: Input<string>;
  registryUsername: Input<string>;
  registryPassword: Input<string>;
}
