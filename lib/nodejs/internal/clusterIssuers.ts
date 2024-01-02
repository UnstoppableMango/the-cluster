import { Input, Output, all, output } from '@pulumi/pulumi';
import * as inputs from '@pulumi/kubernetes/types/input';
import * as outputs from '@pulumi/kubernetes/types/output';
import { certmanager } from '@unstoppablemango/thecluster-crds/types/input';
import { Pki } from '../apps';
import { Apps } from './apps';

type Labels = Exclude<inputs.meta.v1.ObjectMeta['labels'], undefined>;

export type Selector = (issuers: Exclude<ClusterIssusers, 'group' | 'kind'>) => Output<string>;

export class Trust {
  private _issuer: Output<string>;
  constructor(private _pki: Pki, issuer: Input<string>) {
    this._issuer = output(issuer);
  }

  // I'll figure this out when I don't have such a terrible headache...
  // public with(labels: Labels): outputs.meta.v1.ObjectMeta['labels'] {
  //   // return all([this._pki.trustLabel, labels]).apply(([t, l]) => ({
  //   //   [t]: this._issuer,
  //   //   ...Object.keys(l).map(k => ({ [k]: output(l[k]) })),
  //   // }));
  //   output(labels).apply(result => );
  // }

  public get label(): Output<[string, string]> {
    return all([this._pki.trustLabel, this._issuer]);
  }

  // Can we re-use types somehow? `Output<outputs.meta.v1.ObjectMeta['labels']>`
  // Does this impl cause usage issues? Could explain why there's not a built-in type
  public get labels(): Output<Record<string, Output<string>>> {
    return this._pki.trustLabel.apply(t => ({
      [t]: output(this._issuer),
    }));
  }
}

export class Inject {
  private _issuer: Output<string>;
  constructor(issuer: Input<string>) {
    this._issuer = output(issuer);
  }

  public get label(): Output<[string, string]> {
    return all(['cert-manager.io/cluster-issuer', this._issuer]);
  }
}

export class ClusterIssusers {
  constructor(private _apps: Apps) { }

  public get group(): Output<string> {
    return this._apps.pki.clusterIssuers.group;
  }

  public get kind(): Output<string> {
    return this._apps.pki.clusterIssuers.kind;
  }

  public get prod(): Output<string> {
    return this._apps.pki.clusterIssuers.prod;
  }

  public get stage(): Output<string> {
    return this._apps.pki.clusterIssuers.stage;
  }

  public get staging(): Output<string> {
    return this._apps.pki.clusterIssuers.staging;
  }

  public get selfsigned(): Output<string> {
    return this._apps.pki.clusterIssuers.selfSigned;
  }

  public get root(): Output<string> {
    return this._apps.pki.clusterIssuers.root;
  }

  public get postgres(): Output<string> {
    return this._apps.pki.clusterIssuers.postgres;
  }

  public get keycloak(): Output<string> {
    return this._apps.pki.clusterIssuers.keycloak;
  }

  public trust(selector: Selector): Trust {
    return new Trust(this._apps.pki, selector(this));
  }

  public inject(selector: Selector): Inject {
    return new Inject(selector(this));
  }

  public ref(selector: Selector): certmanager.v1.CertificateSpecIssuerRefArgs {
    const issuer = selector(this);
    return { group: this.group, kind: this.kind, name: issuer };
  }
}
