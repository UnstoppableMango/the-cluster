import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class LoadBalancers {
  constructor(private _apps: Apps) { }

  public get metallb(): Output<string> {
    return this._apps.metallb.loadBalancerClass;
  }
}
