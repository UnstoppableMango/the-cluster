import * as k8s from '@pulumi/kubernetes';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { Provider } from '@pulumi/postgresql';
import { Output } from '@pulumi/pulumi';
import { lazyRef } from '../app';
import { b64decode } from '../util';

export interface Hosts {
	internal: Output<string>;
}

export class PostgresqlLa {
	private _provider?: Provider;
	private _ref = lazyRef('postgresql', this._cluster);
	private _k8sOpts = { provider: this._k8sProvider };
	constructor(private _cluster: string, private _k8sProvider: k8s.Provider) {}

	public get clusterHostname(): Output<string> {
		return this._ref.value.requireOutput('clusterHostname') as Output<string>;
	}

	public get database(): Output<string> {
		return this._ref.value.requireOutput('primaryDatabase') as Output<string>;
	}

	public get hosts(): Output<Hosts> {
		return this._ref.value.requireOutput('hosts') as Output<Hosts>;
	}

	public get ip(): Output<string> {
		return this._ref.value.requireOutput('ip') as Output<string>;
	}

	public get port(): Output<number> {
		return this._ref.value.requireOutput('port');
	}

	public get provider(): Provider {
		if (!this._provider) {
			// TODO: Get the `pulumi` user working...
			// const secret = Secret.get('pulumi', 'postgres/pulumi-cert', this._k8sOpts);
			const secret = Secret.get('pulumi', 'postgres/postgres-cert', this._k8sOpts);
			this._provider = new Provider('postgresql', {
				// username: 'pulumi',
				host: this.hosts.internal,
				database: this.database,
				clientcert: {
					sslinline: true,
					cert: secret.data.apply(d => d['tls.crt']).apply(b64decode),
					key: secret.data.apply(d => d['tls.key']).apply(b64decode),
				},
			});
		}

		return this._provider;
	}
}
