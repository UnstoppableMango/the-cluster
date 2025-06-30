import * as nginxIngressOperatorApp from '../apps/nginx-ingress-operator';
import { Apps } from './apps';

export class Versions {
	constructor(private _apps: Apps) {}

	public get nginxIngressOperator(): nginxIngressOperatorApp.Versions {
		return this._apps.nginxIngressOperator.versions;
	}
}
