import { Output, StackReference } from '@pulumi/pulumi';
import { lazyRef } from '../app';

export interface Namespaces {
  media: Output<string>;
  postgres: Output<string>;
  keycloak: Output<string>;
}

export class Shared {
  private readonly _ref = lazyRef('shared', this._cluster);
  constructor(private _cluster: string) { }

  public get ref(): StackReference {
    return this._ref.value;
  }

  public get mediaNamespace(): Output<string> {
    return this.ref.requireOutput('mediaNamespace') as Output<string>;
  }

  public get postgresNamespace(): Output<string> {
    return this.ref.requireOutput('postgresNamespace') as Output<string>;
  }

  public get namespaces(): Namespaces {
    return this.ref.requireOutput('namespaces') as Output<Namespaces>;
  }
}
