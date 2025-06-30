import { Output, StackReference } from '@pulumi/pulumi';
import { lazyRef } from '../app';

export interface Pvcs {
  music: Output<string>;
  movies: Output<string>;
  tv: Output<string>;
  anime: Output<string>;
  movies4k: Output<string>;
  tv4k: Output<string>;
}

export class Storage {
  private _ref = lazyRef('storage', this._cluster);
  constructor(private _cluster: string) { }

  public get ref(): StackReference {
    return this._ref.value;
  }

  public get claims(): Output<Output<string>[]> {
    return this.ref.requireOutput('claims') as Output<Output<string>[]>;
  }

  public get volumes(): Output<Output<string>[]> {
    return this.ref.requireOutput('volumes') as Output<Output<string>[]>;
  }
}
