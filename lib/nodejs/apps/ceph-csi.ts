import { Output } from '@pulumi/pulumi';
import { AppRefs } from '../internal/apps';

export interface StorageClasses {
  rbd: Output<string>;
  cephfs: Output<string>;
}

export class CephCsi {
  constructor(private _refs: AppRefs) { }

  public get storageClasses(): StorageClasses {
    return {
      rbd: this._refs.cephCsi.requireOutput('rbdClass') as Output<string>,
      cephfs: this._refs.cephCsi.requireOutput('cephfsClass') as Output<string>,
    }
 }
}
