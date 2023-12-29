import { Output } from '@pulumi/pulumi';
import { lazyRef } from '../app';

export class Deemix {
  private _ref = lazyRef('deemix', this._cluster);
  constructor(private _cluster: string) {}

  public get service(): Output<string> {
    return this._ref.value.requireOutput('service') as Output<string>;
  }
}
