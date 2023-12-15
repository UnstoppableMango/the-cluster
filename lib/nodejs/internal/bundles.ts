import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';
import { Bundle } from '../apps';

export class Bundles {
  constructor(private _apps: Apps) { }

  public get root(): Output<Bundle> {
    return this._apps.pki.bundles.root;
  }
}
