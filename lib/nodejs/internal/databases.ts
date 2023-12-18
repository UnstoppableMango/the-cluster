import { Output, output } from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { Apps } from './apps';
import { Refs } from './refs';
import { LazyMap } from '../util';

export interface PostgreSqlDatabase {
  name: Output<string>;
  clusterIp: Output<string>;
  ip: Output<string>;
  hostname: Output<string>;
  port: Output<number>;
  ownerGroup: Output<string>;
  owner: {
    username: Output<string>;
    password: Output<string>;
  };
  provider: pg.Provider;
}

export class Databases {
  private _pg = this._apps.postgresqlHa;
  private _dbs = new LazyMap<PostgreSqlDatabase>([
    ['dex', this.database],
    ['drone', this.database],
    ['keycloak', this.database],
    ['kong', this.database],
    ['lapislazuli', this.database],
  ], this);

  constructor(private _refs: Refs, private _apps: Apps) { }

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

  public get lapislazuli(): PostgreSqlDatabase {
    return this._dbs.get('lapislazuli');
  }

  public get postgres(): Omit<PostgreSqlDatabase, 'ownerGroup'> {
    return {
      name: this._pg.database,
      clusterIp: this._pg.clusterIp,
      ip: this._pg.ip,
      hostname: this._pg.hostname,
      port: this._pg.port,
      owner: this._pg.users.postgres,
      provider: this._pg.provider,
    };
  }

  private database(name: string): PostgreSqlDatabase {
    const user = this._pg.user(name);
    const ref = this._refs.ref(`${name}-db`);
    return {
      name: output(name),
      clusterIp: ref.requireOutput('clusterIp') as Output<string>,
      ip: ref.requireOutput('ip') as Output<string>,
      hostname: ref.requireOutput('hostname') as Output<string>,
      port: ref.requireOutput('port') as Output<number>,
      owner: user,
      ownerGroup: ref.requireOutput('ownerGroup') as Output<string>,
      provider: new pg.Provider(name, {
        host: this._pg.clusterIp,
        username: user.username,
        password: user.password,
        database: name,
        sslmode: 'disabled',
      }),
    };
  }
}
