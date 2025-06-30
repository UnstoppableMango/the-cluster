import { Refs } from '../internal';

export class TrustManager {
	public namespace = this._refs.trustManager.requireOutput('namespace');
	public trustNamespace = this._refs.trustManager.requireOutput('trustNamespace');
	constructor(private _refs: Refs) {}
}
