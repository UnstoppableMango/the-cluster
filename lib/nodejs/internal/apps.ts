import * as k8s from '@pulumi/kubernetes';
import {
	ActionsRunnerController,
	CephCsi,
	CertManager,
	CloudflareIngress,
	Deemix,
	FileBrowser,
	Keycloak,
	Metallb,
	NginxIngress,
	NginxIngressOperator,
	PiHole,
	Pki,
	PostgresqlHa,
	PostgresqlLa,
	TrustManager,
} from '../apps';
import { Refs } from './refs';

export class Apps {
	private _actionsRunnerController?: ActionsRunnerController;
	private _cephCsi?: CephCsi;
	private _certManager?: CertManager;
	private _cloudflareIngress?: CloudflareIngress;
	private _deemix?: Deemix;
	private _filebrowser?: FileBrowser;
	private _keycloak?: Keycloak;
	private _metallb?: Metallb;
	private _nginxIngress?: NginxIngress;
	private _nginxIngressOperator?: NginxIngressOperator;
	private _pihole?: PiHole;
	private _pki?: Pki;
	private _postgresqlHa?: PostgresqlHa;
	private _postgresqlLa?: PostgresqlLa;
	private _trustManager?: TrustManager;

	// Poor man's DI is killing me
	constructor(private _refs: Refs, private _provider: k8s.Provider) {}

	public get actionsRunnerController(): ActionsRunnerController {
		if (!this._actionsRunnerController) {
			this._actionsRunnerController = new ActionsRunnerController(this._refs);
		}

		return this._actionsRunnerController;
	}

	public get cephCsi(): CephCsi {
		if (!this._cephCsi) {
			this._cephCsi = new CephCsi(this._refs);
		}

		return this._cephCsi;
	}

	public get certManager(): CertManager {
		if (!this._certManager) {
			this._certManager = new CertManager(this._refs);
		}

		return this._certManager;
	}

	public get cloudflareIngress(): CloudflareIngress {
		if (!this._cloudflareIngress) {
			this._cloudflareIngress = new CloudflareIngress(this._refs);
		}

		return this._cloudflareIngress;
	}

	public get deemix(): Deemix {
		if (!this._deemix) {
			this._deemix = new Deemix(this._refs.cluster);
		}

		return this._deemix;
	}

	public get filebrowser(): FileBrowser {
		if (!this._filebrowser) {
			this._filebrowser = new FileBrowser(this._refs.cluster);
		}

		return this._filebrowser;
	}

	public get keycloak(): Keycloak {
		if (!this._keycloak) {
			this._keycloak = new Keycloak(this._refs);
		}

		return this._keycloak;
	}

	public get metallb(): Metallb {
		if (!this._metallb) {
			this._metallb = new Metallb(this._refs);
		}

		return this._metallb;
	}

	public get nginxIngress(): NginxIngress {
		if (!this._nginxIngress) {
			this._nginxIngress = new NginxIngress(this._refs);
		}

		return this._nginxIngress;
	}

	public get nginxIngressOperator(): NginxIngressOperator {
		if (!this._nginxIngressOperator) {
			this._nginxIngressOperator = new NginxIngressOperator(this._refs.cluster);
		}

		return this._nginxIngressOperator;
	}

	public get pihole(): PiHole {
		if (!this._pihole) {
			this._pihole = new PiHole(this._refs);
		}

		return this._pihole;
	}

	public get pki(): Pki {
		if (!this._pki) {
			this._pki = new Pki(this._refs);
		}

		return this._pki;
	}

	public get postgresqlHa(): PostgresqlHa {
		if (!this._postgresqlHa) {
			this._postgresqlHa = new PostgresqlHa(this._refs);
		}

		return this._postgresqlHa;
	}

	public get postgresqlLa(): PostgresqlLa {
		if (!this._postgresqlLa) {
			this._postgresqlLa = new PostgresqlLa(this._refs.cluster, this._provider);
		}

		return this._postgresqlLa;
	}

	public get trustManager(): TrustManager {
		if (!this._trustManager) {
			this._trustManager = new TrustManager(this._refs);
		}

		return this._trustManager;
	}
}
