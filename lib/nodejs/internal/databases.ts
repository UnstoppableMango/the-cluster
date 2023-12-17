import { Output, output } from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { Apps } from './apps';
import { LazyMap } from '../util';

export interface PostgreSqlDatabase {
  name: Output<string>
  username: Output<string>;
  password: Output<string>;
  provider: pg.Provider;
}

export class Databases {
  private _dbs = new LazyMap<PostgreSqlDatabase>([
    ['dex', this.database],
    ['drone', this.database],
    ['keycloak', this.database],
  ], this);

  constructor(private _apps: Apps) { }

  public get dex(): PostgreSqlDatabase {
    return this._dbs.get('dex');
  }

  public get drone(): PostgreSqlDatabase {
    return this._dbs.get('drone');
  }

  public get keycloak(): PostgreSqlDatabase {
    return this._dbs.get('keycloak');
  }

  public get kong(): PostgreSqlDatabase {
    return this._dbs.get('kong');
  }

  public get postgres(): PostgreSqlDatabase {
    return {
      name: this._apps.postgresqlHa.database,
      username: this._apps.postgresqlHa.users.postgres.username,
      password: this._apps.postgresqlHa.users.postgres.password,
      provider: this._apps.postgresqlHa.provider,
    };
  }

  private database(name: string): PostgreSqlDatabase {
    const user = this._apps.postgresqlHa.user(name);
    return {
      name: output(name),
      username: user.username,
      password: user.password,
      provider: new pg.Provider(name, {
        host: this._apps.postgresqlHa.hostname,
        username: user.username,
        password: user.password,
        database: name,
        sslmode: 'disabled',
      }),
    };
  }
}
