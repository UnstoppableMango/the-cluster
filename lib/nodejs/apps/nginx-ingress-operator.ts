import { Output } from '@pulumi/pulumi';
import { lazyRef } from '../app';

export interface Versions {
	nginxIngress: Output<string>;
	nginxIngressOperator: Output<string>;
}

export class NginxIngressOperator {
	private _ref = lazyRef('nginx-ingress-operator', this._cluster);
	constructor(private _cluster: string) {}

	public get versions(): Versions {
		return this._ref.value.requireOutput('versions') as Output<Versions>;
	}
}
