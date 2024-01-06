import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export class CloudflareIngress {
  constructor(private _refs: Refs) { }

  public get ingressClass(): Output<string> {
    return this._refs.cloudflareIngress.requireOutput('ingressClass') as Output<string>;
  }

  public get theclusterIoClassName(): Output<string> {
    return this._refs.cloudflareIngress.requireOutput('theclusterIoClassName') as Output<string>;
  }

  public get unmangoNetClassName(): Output<string> {
    return this._refs.cloudflareIngress.requireOutput('unmangoNetClassName') as Output<string>;
  }
}
