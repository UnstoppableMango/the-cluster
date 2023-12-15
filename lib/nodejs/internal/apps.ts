import {
  CephCsi,
  CertManager,
  CloudflareIngress,
  Keycloak,
  Metallb,
  NginxIngress,
  PiHole,
  Pki,
  PostgreSql,
  TrustManager
} from '../apps';
import { Refs } from './refs';

export class Apps {
  private _cephCsi?: CephCsi;
  private _certManager?: CertManager;
  private _cloudflareIngress?: CloudflareIngress;
  private _keycloak?: Keycloak;
  private _metallb?: Metallb;
  private _nginxIngress?: NginxIngress;
  private _pihole?: PiHole;
  private _pki?: Pki;
  private _postgresql?: PostgreSql;
  private _trustManager?: TrustManager;

  constructor(private _refs: Refs) { }

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
      return new NginxIngress(this._refs);
    }

    return this._nginxIngress;
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

  public get postgresql(): PostgreSql {
    if (!this._postgresql) {
      this._postgresql = new PostgreSql(this._refs);
    }

    return this.postgresql;
  }

  public get trustManager(): TrustManager {
    if (!this._trustManager) {
      this._trustManager = new TrustManager(this._refs);
    }

    return this._trustManager;
  }
}
