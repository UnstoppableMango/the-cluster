import { StackReference, Output, all, output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/postgresql';
import { cluster } from '../config';
import { PostgreSqlOutputs } from '../types';
import { AppRefs } from '../internal/apps';

export interface Credentials {
  username: Output<string>;
  password: Output<string>;
}

export class PostgreSql {
  private _provider: Provider | undefined;
  private _user: Output<Credentials> | undefined;
  private _ref = this._refs.postgresql;
  constructor(private _refs: AppRefs) { }

  public get credentials(): Output<Output<Credentials>[]> {
    return this._ref.requireOutput('credentials') as Output<Output<Credentials>[]>;
  }

  public get hostname(): Output<string> {
    return this._ref.requireOutput('hostname') as Output<string>;
  }

  public get database(): Output<string> {
    return this._ref.requireOutput('database') as Output<string>;
  }

  public get port(): Output<number> {
    return this._ref.requireOutput('port') as Output<number>;
  }

  public get ip(): Output<string> {
    return this._ref.requireOutput('ip') as Output<string>;
  }

  public get user(): Output<Credentials> {
    if (!this._user) {
      const user = output(this.credentials)
        .apply(c => c.find(x => x.username === 'postgres'))
        .apply(x => x ?? { username: '', password: '' });
      this._user = output(user) as Output<Credentials>;
    }

    return this._user;
  }

  public get provider(): Provider {
    if (!this._provider) {
      this._provider = new Provider('postgresql', {
        username: this.user.apply(x => x?.username ?? ''),
        password: this.user.apply(x => x?.password ?? ''),
        host: this.hostname,
        port: this.port,
        database: this.database,
        sslmode: 'disable',
      });
    }

    return this._provider;
  }
}
