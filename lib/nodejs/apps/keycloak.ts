import { Provider } from '@pulumi/keycloak';
import { Input, interpolate, Output, output } from '@pulumi/pulumi';
import { Refs } from '../internal';

interface HostsShape {
	external?: string;
	internal?: string;
	aliases?: {
		external?: string[];
		internal?: string[];
	};
}

type HostsShapeUnion = HostsShape | string | string[];
export { HostsShapeUnion as HostsShape };

function isHostsShape(x: any): x is HostsShape {
	if (typeof x !== 'object') return false;

	if ('external' in x) return true;
	if ('internal' in x) return true;
	if ('aliases' in x) return true; // Eh... lol

	return false;
}

function hostsRedirectUris(hosts: HostsShape): string[] {
	const results = [];

	if (hosts.external) results.push(hosts.external);
	if (hosts.internal) results.push(hosts.internal);

	if (hosts.aliases?.external) {
		results.push(...hosts.aliases.external);
	}

	if (hosts.aliases?.internal) {
		results.push(...hosts.aliases.internal);
	}

	return results;
}

// Would be great if this worked the way I want it to...
export function redirectUris(host: Input<string>): Output<string>;
export function redirectUris(...hosts: (Input<string | Input<string>[]> | HostsShape)[]): Output<Output<string>[]>;
export function redirectUris(
	...hosts: (Input<string | Input<string>[]> | HostsShape)[]
): Output<Output<string>[] | string> {
	// Typescript seems to be happy with these signatures, despite this code not fulfilling the contract...
	if (hosts.length === 1 && !isHostsShape(hosts[0])) {
		// Stupidity to make typescript happy
		const result = output(hosts[0]);
		if (Output.isInstance<string>(result)) {
			return result;
		}
	}

	return output(hosts).apply(h =>
		h
			.flatMap(mhosts => {
				if (typeof mhosts === 'string') {
					return [mhosts];
				} else if (isHostsShape(mhosts)) {
					return hostsRedirectUris(mhosts);
				}

				return mhosts;
			})
			.map(host => {
				if (host.startsWith('http')) {
					if (host.endsWith('/oauth2/callback')) {
						return output(host);
					}

					return interpolate`${host}/oauth2/callback`;
				}

				return interpolate`https://${host}/oauth2/callback`;
			})
	);
}

export interface Hosts {
	external: Output<string>;
	internal: Output<string>;
}

export class Keycloak {
	private _ref = this._refs.keycloak;
	private _provider: Provider | undefined;
	constructor(private _refs: Refs) {}

	public get hosts(): Output<Hosts> {
		return this._ref.requireOutput('hosts') as Output<Hosts>;
	}

	public get hostname(): Output<string> {
		return this._ref.requireOutput('hostname') as Output<string>;
	}

	public get username(): Output<string> {
		return this._ref.requireOutput('username') as Output<string>;
	}

	public get password(): Output<string> {
		return this._ref.requireOutput('password') as Output<string>;
	}

	public get provider(): Provider {
		if (!this._provider) {
			this._provider = new Provider('keycloak', {
				url: interpolate`https://${this.hosts.external}`,
				username: 'admin',
				password: this.password,
				clientId: 'admin-cli',
			});
		}

		return this._provider;
	}
}
