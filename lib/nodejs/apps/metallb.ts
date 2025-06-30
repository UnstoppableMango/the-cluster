import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export class Metallb {
	private _ref = this._refs.metallb;
	constructor(private _refs: Refs) {}

	public get pool(): Output<string> {
		return this._ref.requireOutput('poolName') as Output<string>;
	}

	public get l2Advertisement(): Output<string> {
		return this._ref.requireOutput('advertisementName') as Output<string>;
	}

	public get loadBalancerClass(): Output<string> {
		return this._ref.requireOutput('loadBalancerClass') as Output<string>;
	}

	public get addresses(): Output<Output<string>[]> {
		return this._ref.requireOutput('addresses') as Output<Output<string>[]>;
	}
}
