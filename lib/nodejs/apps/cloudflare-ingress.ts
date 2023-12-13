import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export class CloudflareIngress {
  constructor(private _refs: Refs) { }

  public get ingressClass(): Output<string> {
    return this._refs.cloudflareIngress.requireOutput('ingressClass') as Output<string>;
  }
}
