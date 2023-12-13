import { Output, output } from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { Apps } from './apps';

export interface PostgreSqlDatabase {
  name: Output<string>
  username: Output<string>;
  password: Output<string>;
  provider: pg.Provider;
}

export class Databases {
  constructor(private _apps: Apps) { }

  public get dex(): PostgreSqlDatabase {
    return this.database('dex');
  }

  public get drone(): PostgreSqlDatabase {
    return this.database('drone');
  }

  public get keycloak(): PostgreSqlDatabase {
    return this.database('keycloak');
  }

  public get postgres(): PostgreSqlDatabase {
    return {
      name: this._apps.postgresql.database,
      username: this._apps.postgresql.users.postgres.username,
      password: this._apps.postgresql.users.postgres.password,
      provider: this._apps.postgresql.provider,
    };
  }

  private database(name: string): PostgreSqlDatabase {
    const user = this._apps.postgresql.user(name);
    return {
      name: output(name),
      username: user.username,
      password: user.password,
      provider: new pg.Provider(name, {
        host: this._apps.postgresql.hostname,
        username: user.username,
        password: user.password,
        database: name,
        sslmode: 'disabled',
      }),
    };
  }
}
