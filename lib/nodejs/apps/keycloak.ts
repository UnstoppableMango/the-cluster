import { Output, interpolate } from '@pulumi/pulumi';
import { Provider } from '@pulumi/keycloak';
import { Refs } from '../internal';

export class Keycloak {
  private _ref = this._refs.keycloak;
  private _provider: Provider | undefined;
  constructor(private _refs: Refs) { }

  public get hostname(): Output<string> {
    return this._ref.requireOutput('hostname') as Output<string>;
  }

  public get username(): Output<string> {
    return this._ref.requireOutput('username') as Output<string>;
  }

  public get password(): Output<string> {
    return this._ref.requireOutput('password') as Output<string>;
  }

  public get provider(): Provider {
    if (!this._provider) {
      this._provider = new Provider('keycloak', {
        url: interpolate`https://${this.hostname}`,
        username: 'admin',
        password: this.password,
        clientId: 'admin-cli',
      });
    }

    return this._provider;
  }
}
