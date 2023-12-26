import { Output, output } from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { Apps } from './apps';
import { Refs } from './refs';
import { LazyMap } from '../util';

export interface PostgreSqlDatabase {
  name: Output<string>;
  ip: Output<string>;
  hostname: Output<string>;
  port: Output<number>;
  ownerGroup: Output<string>;
  owner: Output<string>;
}

export class Databases {
  private _pg = this._apps.postgresqlLa;
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
      ip: this._pg.ip,
      hostname: this._pg.clusterHostname,
      port: this._pg.port,
      owner: output('postgres'),
    };
  }

  private database(name: string): PostgreSqlDatabase {
    const ref = this._refs.ref(`${name}-db`);
    return {
      name: output(name),
      ip: this._pg.ip,
      hostname: this._pg.clusterHostname,
      port: this._pg.port,
      owner: ref.requireOutput('owner') as Output<string>,
      ownerGroup: ref.requireOutput('ownerGroup') as Output<string>,
    };
  }
}
