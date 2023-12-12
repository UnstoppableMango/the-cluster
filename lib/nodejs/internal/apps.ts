import { StackReference } from '@pulumi/pulumi';
import * as app from '../app';

export class AppRefs {
  private _cephCsi: StackReference | undefined;
  private _certManager: StackReference | undefined;
  private _cloudflareIngress: StackReference | undefined;
  private _keycloak: StackReference | undefined;
  private _metallb: StackReference | undefined;
  private _nginxIngress: StackReference | undefined;
  private _pihole: StackReference | undefined;
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

  public get postgresql(): StackReference {
    if (!this._postgresql) {
      this._postgresql = this.ref('postgresql');
    }

    return this._postgresql;
  }

}
