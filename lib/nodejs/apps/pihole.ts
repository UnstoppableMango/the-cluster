import { interpolate, Output } from '@pulumi/pulumi';
import { Provider } from '@unmango/pulumi-pihole';
import { Refs } from '../internal';

export class PiHole {
	private _ref = this._refs.pihole;
	private _provider: Provider | undefined;
	constructor(private _refs: Refs) {}

	public get hostname(): Output<string> {
		return this._ref.requireOutput('hostname') as Output<string>;
	}

	public get password(): Output<string> {
		return this._ref.requireOutput('password') as Output<string>;
	}

	public get provider(): Provider {
		if (!this._provider) {
			this._provider = new Provider('pihole', {
				url: interpolate`https://${this.hostname}`,
				password: this.password,
			});
		}

		return this._provider;
	}
}
