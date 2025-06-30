import { interpolate, Output } from '@pulumi/pulumi';
import { Apps } from './apps';
import { Refs } from './refs';

export interface Realm {
	id: Output<string>;
	discoveryUrl: Output<string>;

	/**
	 * Of the form interpolate`https://${app.hostname}/realms/${id}`
	 */
	issuerUrl: Output<string>;
	tokenUrl: Output<string>;
	authorizationUrl: Output<string>;
	apiBaseUrl: Output<string>;
	userinfoEndpoint: Output<string>;
}

export class Realms {
	constructor(private _refs: Refs, private _apps: Apps) {}

	public get external(): Realm {
		return this.realm('externalRealmId');
	}

	public get cluster(): Realm {
		return this.realm('clusterRealmId');
	}

	public get groupNames(): Output<Output<string>[]> {
		return this._refs.identity.requireOutput('groupNames') as Output<Output<string>[]>;
	}

	public get groupsScopeName(): Output<string> {
		return this._refs.identity.requireOutput('groupsScopeName') as Output<string>;
	}

	public get groups(): Output<Record<string, Output<string>>> {
		return this._refs.identity.requireOutput('groups') as Output<Record<string, Output<string>>>;
	}

	private realm(idKey: string): Realm {
		const id = this._refs.identity.requireOutput(idKey) as Output<string>;
		const issuerUrl = interpolate`https://${this._apps.keycloak.hostname}/realms/${id}`;
		const baseUrl = interpolate`${issuerUrl}/protocol/openid-connect`;
		return {
			id,
			issuerUrl,
			apiBaseUrl: baseUrl,
			discoveryUrl: interpolate`${issuerUrl}/.well-known/openid-configuration`,
			tokenUrl: interpolate`${baseUrl}/token`,
			authorizationUrl: interpolate`${baseUrl}/auth`,
			userinfoEndpoint: interpolate`${baseUrl}/userinfo`,
		};
	}
}
