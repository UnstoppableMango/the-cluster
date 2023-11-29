import { ComponentResource, ComponentResourceOptions } from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

export interface Oauth2ProxyArgs {
  redirectUrl: string;
}

export class Oauth2Proxy extends ComponentResource {

  constructor(name: string, args: Oauth2ProxyArgs, opts: ComponentResourceOptions) {
    super('unmango:OAuth2Proxy', name, args, opts);
    this.registerOutputs();
  }

}
