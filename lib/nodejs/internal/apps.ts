import { StackReference } from '@pulumi/pulumi';
import * as app from '../app';
import {
  CephCsi,
  CertManager,
  CloudflareIngress,
  Keycloak,
  Metallb,
  NginxIngress,
  PiHole,
  Pki,
  PostgreSql
} from '../apps';

export class AppRefs {
  private _cephCsi: StackReference | undefined;
  private _certManager: StackReference | undefined;
  private _cloudflareIngress: StackReference | undefined;
  private _keycloak: StackReference | undefined;
  private _metallb: StackReference | undefined;
  private _nginxIngress: StackReference | undefined;
  private _pihole: StackReference | undefined;
  private _pki: StackReference | undefined;
  private _postgresql: StackReference | undefined;

  constructor(private cluster: string) { }

  private ref(project: string): StackReference {
    return app.ref(project, this.cluster);
  }

  public get cephCsi(): StackReference {
    if (!this._cephCsi) {
      this._cephCsi = this.ref('ceph-csi');
    }

    return this.cephCsi;
  }

  public get certManager(): StackReference {
    if (!this._certManager) {
      this._certManager = this.ref('cert-manager');
    }

    return this._certManager;
  }

  public get cloudflareIngress(): StackReference {
    if (!this._cloudflareIngress) {
      this._cloudflareIngress = this.ref('cloudflare-ingress');
    }

    return this._cloudflareIngress;
  }

  public get keycloak(): StackReference {
    if (!this._keycloak) {
      this._keycloak = this.ref('keycloak');
    }

    return this._keycloak;
  }

  public get metallb(): StackReference {
    if (!this._metallb) {
      this._metallb = this.ref('metallb');
    }

    return this._metallb;
  }

  public get nginxIngress(): StackReference {
    if (!this._nginxIngress) {
      this._nginxIngress = this.ref('nginx-ingress');
    }

    return this._nginxIngress;
  }

  public get pihole(): StackReference {
    if (!this._pihole) {
      this._pihole = this.ref('pihole');
    }

    return this._pihole;
  }

  public get pki(): StackReference {
    if (!this._pki) {
      this._pki = this.ref('pki');
    }

    return this._pki;
  }

  public get postgresql(): StackReference {
    if (!this._postgresql) {
      this._postgresql = this.ref('postgresql');
    }

    return this._postgresql;
  }
}

export class Apps {
  private _cephCsi: CephCsi | undefined;
  private _certManager: CertManager | undefined;
  private _cloudflareIngress: CloudflareIngress | undefined;
  private _keycloak: Keycloak | undefined;
  private _metallb: Metallb | undefined;
  private _nginxIngress: NginxIngress | undefined;
  private _pihole: PiHole | undefined;
  private _pki: Pki | undefined;
  private _postgresql: PostgreSql | undefined;

  constructor(private _refs: AppRefs) { }

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
      this._pihole = new PiHole(this._refs);
    }

    return this._pki;
  }

  public get postgresql(): PostgreSql {
    if (!this._postgresql) {
      this._postgresql = new PostgreSql(this._refs);
    }

    return this.postgresql;
  }
}
