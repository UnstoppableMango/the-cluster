import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export interface Bundles {
  key: Output<string>;
  jksKey: Output<string>;
  p12Key: Output<string>;
}

export interface ClusterIssusers {
  group: Output<string>;
  kind: Output<string>;
  prod: Output<string>;
  stage: Output<string>;
  staging: Output<string>;
  selfSigned: Output<string>;
  root: Output<string>;
  postgres: Output<string>;
  keycloak: Output<string>;
}

export interface Issuers {
  group: Output<string>;
  kind: Output<string>;
}

export interface ConfigMaps {
  root: Output<string>;
  postgres: Output<string>;
  keycloak: Output<string>;
}

export class Pki {
  constructor(private _refs: Refs) { }

  public get bundles(): Bundles {
    return this._refs.pki.requireOutput('bundles') as Output<Bundles>;
  }

  public get configMaps(): ConfigMaps {
    return this._refs.pki.requireOutput('configMaps') as Output<ConfigMaps>;
  }

  public get clusterIssuers(): ClusterIssusers {
    return this._refs.pki.requireOutput('clusterIssuers') as Output<ClusterIssusers>;
  }

  public get issuers(): Issuers {
    return this._refs.pki.requireOutput('issuers') as Output<Issuers>;
  }

  public get trustLabel(): Output<string> {
    return this._refs.pki.requireOutput('trustLabel') as Output<string>;
  }
}
