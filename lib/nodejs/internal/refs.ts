import { StackReference } from '@pulumi/pulumi';
import * as app from '../app';

export class Refs {
  private _actionsRunnerController?: StackReference;
  private _cephCsi?: StackReference;
  private _certManager?: StackReference;
  private _cloudflareIngress?: StackReference;
  private _identity?: StackReference;
  private _keycloak?: StackReference;
  private _keycloakDb?: StackReference;
  private _metallb?: StackReference;
  private _nginxIngress?: StackReference;
  private _pihole?: StackReference;
  private _pki?: StackReference;
  private _postgresqlHa?: StackReference;
  private _trustManager?: StackReference;

  constructor(public cluster: string) { }

  public get actionsRunnerController(): StackReference {
    if (!this._actionsRunnerController) {
      this._actionsRunnerController = this.ref('actions-runner-controller');
    }

    return this._actionsRunnerController;
  }

  public get cephCsi(): StackReference {
    if (!this._cephCsi) {
      this._cephCsi = this.ref('ceph-csi');
    }

    return this._cephCsi;
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

  public get identity(): StackReference {
    if (!this._identity) {
      this._identity = this.ref('identity');
    }

    return this._identity;
  }

  public get keycloak(): StackReference {
    if (!this._keycloak) {
      this._keycloak = this.ref('keycloak');
    }

    return this._keycloak;
  }

  public get keycloakDb(): StackReference {
    if (!this._keycloakDb) {
      this._keycloakDb = this.ref('keycloak-db');
    }

    return this._keycloakDb;
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

  public get postgresqlHa(): StackReference {
    if (!this._postgresqlHa) {
      this._postgresqlHa = this.ref('postgresql-ha');
    }

    return this._postgresqlHa;
  }

  public get trustManager(): StackReference {
    if (!this._trustManager) {
      this._trustManager = this.ref('trust-manager');
    }

    return this._trustManager;
  }

  public ref(project: string): StackReference {
    return app.ref(project, this.cluster);
  }
}
