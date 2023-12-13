import { Output } from '@pulumi/pulumi';
import { Refs } from './refs';

export interface Realm {
  id: Output<string>;
}

export interface Outputs {
  external: Output<Realm>;
  cluster: Output<Realm>;
}

export class Realms {
  constructor(private _refs: Refs) { }

  public get outputs(): Output<Outputs> {
    return this._refs.identity.requireOutput('realms') as Output<Outputs>;
  }

  public get external(): Output<Realm> {
    return this.outputs.external;
  }

  public get cluster(): Output<Realm> {
    return this.outputs.cluster;
  }

  public get groupNames(): Output<Output<string>[]> {
    return this._refs.identity.requireOutput('groupNames') as Output<Output<string>[]>;
  }

  public get groupsScopeName(): Output<string> {
    return this._refs.identity.requireOutput('groupsScopeName') as Output<string>;
  }

  public get groups(): Output<Record<string, Output<string>>> {
    return this._refs.identity.requireOutput('groups') as Output<Record<string, Output<string>>>;
  }
}
