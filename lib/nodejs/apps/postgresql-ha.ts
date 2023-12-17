import { Output, output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/postgresql';
import { Refs } from '../internal';

export interface User {
  username: Output<string>;
  password: Output<string>;
}

export interface Users {
  repmgr: Output<User>;
  postgres: Output<User>;
  pgpool: Output<User>;
}

export class PostgresqlHa {
  private _provider: Provider | undefined;
  private _ref = this._refs.postgresqlHa;
  constructor(private _refs: Refs) { }

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

  public get users(): Output<Users> {
    return this._ref.requireOutput('users') as Output<Users>;
  }

  public get passwords(): Output<Output<User>[]> {
    return this._ref.requireOutput('passwords') as Output<Output<User>[]>;
  }

  public get clusterIp(): Output<string> {
    return this._ref.requireOutput('clusterIp') as Output<string>;
  }

  public get provider(): Provider {
    if (!this._provider) {
      this._provider = new Provider('postgresql', {
        username: this.users.postgres.username,
        password: this.users.postgres.password,
        host: this.hostname,
        port: this.port,
        database: this.database,
        sslmode: 'disable',
      });
    }

    return this._provider;
  }

  public user(name: string): User {
    return output(this.passwords).apply(x => x.filter(y => y.username === name)[0]);
  }
}
