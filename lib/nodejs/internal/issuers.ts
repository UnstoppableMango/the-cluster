import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class Issuers {
  constructor(private _apps: Apps) { }

  public get group(): Output<string> {
    return this._apps.pki.issuers.group;
  }

  public get kind(): Output<string> {
    return this._apps.pki.issuers.kind;
  }

  public get postgres(): Output<string> {
    return this._apps.pki.issuers.postgres;
  }
}
