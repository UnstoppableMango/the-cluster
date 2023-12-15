import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class ClusterIssusers {
  constructor(private _apps: Apps) { }

  public get group(): Output<string> {
    return this._apps.pki.clusterIssuers.group;
  }

  public get kind(): Output<string> {
    return this._apps.pki.clusterIssuers.kind;
  }

  public get prod(): Output<string> {
    return this._apps.pki.clusterIssuers.prod;
  }

  public get stage(): Output<string> {
    return this._apps.pki.clusterIssuers.stage;
  }

  public get staging(): Output<string> {
    return this._apps.pki.clusterIssuers.staging;
  }

  public get selfsigned(): Output<string> {
    return this._apps.pki.clusterIssuers.selfSigned;
  }

  public get root(): Output<string> {
    return this._apps.pki.clusterIssuers.root;
  }
}
