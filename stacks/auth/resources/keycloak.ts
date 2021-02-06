import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class KeyCloak extends ComponentResource {

  public readonly chartUrl = 'https://charts.bitnami.com/bitnami';
  public readonly app: k8s.helm.v3.Chart;

  constructor(name: string, args: KeyCloakArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:keycloak', name, undefined, opts);

    this.registerOutputs();
  }

}

export interface KeyCloakArgs {
  hmmm: Input<string>;
}
