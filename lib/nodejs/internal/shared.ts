import { Output, StackReference } from '@pulumi/pulumi';
import { lazyRef } from '../app';

export class Shared {
  private readonly _ref = lazyRef('shared', this._cluster);
  constructor(private _cluster: string) { }

  public get ref(): StackReference {
    return this._ref.value;
  }

  public get mediaNamespace(): Output<string> {
    return this.ref.requireOutput('mediaNamespace') as Output<string>;
  }
}