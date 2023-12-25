import { Output } from '@pulumi/pulumi';
import { Refs } from '../internal';

export interface Bundle {
  name: Output<string>;
  key: Output<string>;
  additionalFormats: Output<{
    jks: { key: Output<string> };
    pkcs12: { key: Output<string> };
  }>;
  matchLabels: Output<Record<string, Output<string>>>;
}

export interface Bundles {
  root: Output<Bundle>;
  postgres: Output<Bundle>;
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
}

export interface Issuers {
  group: Output<string>;
  kind: Output<string>;
}

export class Pki {
  constructor(private _refs: Refs) { }

  public get bundles(): Output<Bundles> {
    return this._refs.pki.requireOutput('bundles') as Output<Bundles>;
  }

  public get clusterIssuers(): Output<ClusterIssusers> {
    return this._refs.pki.requireOutput('clusterIssuers') as Output<ClusterIssusers>;
  }

  public get issuers(): Issuers {
    return this._refs.pki.requireOutput('issuers') as Output<Issuers>;
  }

  public get trustLabel(): Output<string> {
    return this._refs.pki.requireOutput('trustLabel') as Output<string>;
  }
}
