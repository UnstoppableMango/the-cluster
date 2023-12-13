import { Output } from '@pulumi/pulumi';
import { AppRefs } from '../internal/apps';

export interface ClusterIssusers {
  prod: Output<string>;
  staging: Output<string>;
  selfsigned: Output<string>;
}

export class Pki {
  constructor(private _refs: AppRefs) { }

  public get clusterIssuers(): Output<ClusterIssusers> {
    return this._refs.pki.requireOutput('clusterIssuers') as Output<ClusterIssusers>;
  }
}
