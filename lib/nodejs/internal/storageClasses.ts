import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class StorageClasses {
  constructor(private _apps: Apps) { }

  public get rbd(): Output<string> {
    return this._apps.cephCsi.storageClasses.rbd;
  }

  public get cephfs(): Output<string> {
    return this._apps.cephCsi.storageClasses.cephfs;
  }
}
