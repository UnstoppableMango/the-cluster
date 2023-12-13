import * as kc from '@pulumi/keycloak';
import { Apps } from './apps';

export interface Keycloak {
  provider: kc.Provider;
}

export class Identities {
  constructor(private _apps: Apps) { }

  public get keycloak(): Keycloak {
    return { provider: this._apps.keycloak.provider };
  }
}
