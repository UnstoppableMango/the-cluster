import { Container, Image } from '@pulumi/docker';
import { ComponentResource, ComponentResourceOptions } from '@pulumi/pulumi';

export class NginxLoadBalancer extends ComponentResource {

  public readonly container: Container;
  public readonly image: Image;

  constructor(name: string, opts?: ComponentResourceOptions) {
    super('unmango:containers:nginx-lb', name, undefined, opts);

    this.image = new Image('load-balancer', {
      build: './load-balancer',
      imageName: 'unstoppablemango/rancher-nginx-load-balancer',
    }, { parent: this });

    this.container = new Container('load-balancer', {
      image: this.image.imageName,
      restart: 'unless-stopped',
      ports: [
        { external: 80, internal: 80 },
        { external: 443, internal: 443 },
      ],
    }, { parent: this });

    this.registerOutputs();
  }

}
