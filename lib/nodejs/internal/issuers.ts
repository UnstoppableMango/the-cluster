import { Output } from '@pulumi/pulumi';
import * as inputs from '@unstoppablemango/thecluster-crds/types/input';
import { Apps } from './apps';

export class Issuers {
	constructor(private _apps: Apps) {}

	public get group(): Output<string> {
		return this._apps.pki.issuers.group;
	}

	public get kind(): Output<string> {
		return this._apps.pki.issuers.kind;
	}

	// public get postgres(): Output<string> {
	//   return this._apps.pki.issuers.postgres;
	// }

	// public issuerRef(
	//   selector: (issuers: Pick<Issuers, 'postgres'>) => Output<string>
	// ): inputs.certmanager.v1.CertificateSpecIssuerRefArgs {
	//   const issuer = selector(this);
	//   return { group: this.group, kind: this.kind, name: issuer };
	// }
}
