import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export interface IngressClasses {
	internal: Output<string>;
	// cluster: Output<string>;
}

export class NginxIngress {
	private _ref = this._refs.nginxIngress;
	constructor(private _refs: Refs) {}

	public get ingressClasses(): IngressClasses {
		return {
			internal: this._ref.requireOutput('internalClass') as Output<string>,
			// cluster: this._ref.requireOutput('clusterClass') as Output<string>,
		};
	}

	public get loadBalancerIp(): Output<string> {
		return this._ref.requireOutput('ip') as Output<string>;
	}
}
