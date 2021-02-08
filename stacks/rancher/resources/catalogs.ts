import { ComponentResource, ComponentResourceOptions, Input, StackReference } from '@pulumi/pulumi';
import { Catalog, CatalogV2 } from '@pulumi/rancher2';
import * as shared from '@unmango/shared';

export class Catalogs extends ComponentResource implements shared.Catalogs {

  private readonly _opts = { parent: this };
  private readonly _state = { clusterId: this.args.clusterId };

  private readonly _githubRef = new StackReference(
    'UnstoppableMango/github-unstoppablemango/prod',
    undefined,
    this._opts,
  );

  public readonly bitnami: Catalog;
  public readonly bitnamiV2: CatalogV2;

  public readonly chartCenter: Catalog;
  public readonly chartCenterV2: CatalogV2;

  public readonly codecentric: Catalog;
  public readonly codecentricV2: CatalogV2;

  public readonly community: Catalog;
  public readonly communityV2: CatalogV2;

  // public readonly helm = Catalog.get('helm', 'helm', undefined, this._opts);

  public readonly inlets: Catalog;

  public readonly jfrog: Catalog;
  public readonly jfrogV2: CatalogV2;

  public readonly k8sAtHome: Catalog;
  public readonly k8sAtHomeV2: CatalogV2;

  public readonly library: Catalog;
  public readonly partners: CatalogV2;
  public readonly rancher: CatalogV2;

  public readonly unstoppableMango: Catalog;
  public readonly unstoppableMangoV2: CatalogV2;

  constructor(name: string, private args: CatalogsArgs, opts?: ComponentResourceOptions) {
    super('unmango:rancher:Catalogs', name, undefined, opts);

    this.bitnami = new Catalog('bitnami', {
      name: 'bitnami',
      url: 'https://charts.bitnami.com/bitnami',
      version: 'helm_v3',
    }, this._opts);

    this.bitnamiV2 = new CatalogV2('bitnami', {
      name: 'bitnami',
      clusterId: this.args.clusterId,
      url: 'https://charts.bitnami.com/bitnami',
    }, this._opts);

    this.chartCenter = new Catalog('chart-center', {
      url: 'https://repo.chartcenter.io',
      version: 'helm_v3',
    }, this._opts);
  
    this.chartCenterV2 = new CatalogV2('chart-center', {
      name: 'chart-center',
      clusterId: this.args.clusterId,
      url: 'https://repo.chartcenter.io',
    }, this._opts);

    this.codecentric = new Catalog('codecentric', {
      name: 'codecentric',
      url: 'https://codecentric.github.io/helm-charts',
      version: 'helm_v3',
    }, this._opts);
  
    this.codecentricV2 = new CatalogV2('codecentric', {
      name: 'codecentric',
      clusterId: this.args.clusterId,
      url: 'https://codecentric.github.io/helm-charts',
    }, this._opts);

    this.community = new Catalog('rancher-community', {
      url: 'https://github.com/rancher/community-catalog',
    }, this._opts);
  
    this.communityV2 = new CatalogV2('rancher-community', {
      clusterId: this.args.clusterId,
      gitRepo: 'https://github.com/rancher/community-catalog',
    }, this._opts);

    this.inlets = new Catalog('inlets', {
      url: 'https://inlets.github.io/inlets-operator',
    }, this._opts);

    this.jfrog = new Catalog('jfrog', {
      url: 'https://github.com/jfrog/charts',
      version: 'helm_v3',
    }, this._opts);
  
    this.jfrogV2 = new CatalogV2('jfrog', {
      clusterId: this.args.clusterId,
      gitRepo: 'https://github.com/jfrog/charts',
    }, this._opts);

    this.k8sAtHome = new Catalog('k8s-at-home', {
      url: 'https://k8s-at-home.com/charts/',
      version: 'helm_v3',
    }, this._opts);
  
    this.k8sAtHomeV2 = new CatalogV2('k8s-at-home', {
      clusterId: this.args.clusterId,
      url: 'https://k8s-at-home.com/charts/',
    }, this._opts);

    this.library = Catalog.get('library', 'library', undefined, this._opts);
    this.partners = CatalogV2.get('partners', 'rancher-partner-charts', this._state, this._opts);
    this.rancher = CatalogV2.get('rancher', 'rancher-charts', this._state, this._opts);

    this.unstoppableMango = new Catalog('unstoppablemango', {
      url: this._githubRef.requireOutput('helmChartsRepoUrl'),
      version: 'helm_v3',
    }, this._opts);
  
    this.unstoppableMangoV2 = new CatalogV2('unstoppablemango', {
      clusterId: this.args.clusterId,
      gitRepo: this._githubRef.requireOutput('helmChartsRepoUrl'),
    }, this._opts);

    this.registerOutputs();
  }

  private getOrCreate(name: string, url?: string, v3 = false): Catalog {
    if (url) {
      const args = v3 ? { url, version: 'helm_v3' } : { url };
      return new Catalog(name, args, this._opts);
    } else {
      throw new Error('Get is not yet supported');
      // return Catalog.get(name, )
    }
  }

}

export interface CatalogsArgs {
  clusterId: Input<string>;
  bitnamiUrl?: string;
  chartCenterUrl?: string;
  codecentricUrl?: string;
  rancherCommunityUrl?: string;
  inletsUrl?: string;
  jfrogUrl?: string;
  k8sAtHomeUrl?: string;
  unstoppableMangoUrl?: string;
}
