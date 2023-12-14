import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class ClusterIssusers {
  constructor(private _apps: Apps) { }

  public get prod(): Output<string> {
    return this._apps.pki.clusterIssuers.prod;
  }

  public get staging(): Output<string> {
    return this._apps.pki.clusterIssuers.staging;
  }

  public get selfsigned(): Output<string> {
    return this._apps.pki.clusterIssuers.selfsigned;
  }
}
