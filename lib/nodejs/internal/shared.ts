import { Output, StackReference } from '@pulumi/pulumi';
import { lazyRef } from '../app';

export interface Namespaces {
  media: Output<string>;
  postgres: Output<string>;
  keycloak: Output<string>;
  pgadmin: Output<string>;
  pulumiOperator: Output<string>;
  nginxIngress: Output<string>;
  redis: Output<string>;
  minio: Output<string>;
}

export class Shared {
  private readonly _ref = lazyRef('shared', this._cluster);
  constructor(private _cluster: string) { }

  public get ref(): StackReference {
    return this._ref.value;
  }

  public get namespaces(): Output<Namespaces> {
    return this.ref.requireOutput('namespaces') as Output<Namespaces>;
  }
}
