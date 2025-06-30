import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export interface StorageClasses {
	rbd: Output<string>;
	cephfs: Output<string>;
}

export class CephCsi {
	constructor(private _refs: Refs) {}

	public get clusterId(): Output<string> {
		return this._refs.cephCsi.requireOutput('clusterId') as Output<string>;
	}

	public get storageClasses(): StorageClasses {
		return {
			rbd: this._refs.cephCsi.requireOutput('rbdClass') as Output<string>,
			cephfs: this._refs.cephCsi.requireOutput('cephfsClass') as Output<string>,
		};
	}
}
