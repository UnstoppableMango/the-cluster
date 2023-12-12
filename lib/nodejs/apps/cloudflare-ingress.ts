import { Output } from '@pulumi/pulumi';
import { AppRefs } from '../internal/apps';

export class CloudflareIngress {
  constructor(private _refs: AppRefs) { }

  public get ingressClass(): Output<string> {
    return this._refs.cloudflareIngress.requireOutput('ingressClass') as Output<string>;
  }
}
