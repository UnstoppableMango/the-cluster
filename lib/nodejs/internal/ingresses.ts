import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class Ingresses {
  constructor(private _apps: Apps) { }

  public get cloudflare(): Output<string> {
    return this._apps.cloudflareIngress.ingressClass;
  }

  public get internal(): Output<string> {
    return this._apps.nginxIngress.ingressClasses.internal;
  }

  // public get cluster(): Output<string> {
  //   return this._apps.nginxIngress.ingressClasses.cluster;
  // }
}
