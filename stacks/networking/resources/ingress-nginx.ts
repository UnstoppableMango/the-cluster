import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class IngressNginx extends ComponentResource {

  public readonly chartUrl = 'https://kubernetes.github.io/ingress-nginx';
  public readonly namespace: k8s.core.v1.Namespace;
  public readonly 

  constructor(name: string, args: IngressNginxArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:ingress-nginx', name, undefined, opts);

    this.registerOutputs();
  }

}

export interface IngressNginxArgs {
  version?: Input<string>;
}
