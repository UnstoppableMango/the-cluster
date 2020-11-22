import { ComponentResource, ComponentResourceOptions, Input, StackReference } from '@pulumi/pulumi';
import { Catalog, CatalogV2 } from '@pulumi/rancher2';
import * as external from '../external/catalogs';

export class Catalogs extends ComponentResource implements external.Catalogs {

  private readonly _opts = { parent: this };
  private readonly _state = { clusterId: this._clusterId };

  private readonly _githubRef = new StackReference(
    'UnstoppableMango/github-unstoppablemango/prod',
    undefined,
    this._opts,
  );

  public readonly bitnami = new Catalog('bitnami', {
    url: 'https://charts.bitnami.com/bitnami',
  }, this._opts);

  public readonly bitnamiV2 = new CatalogV2('bitnami', {
    clusterId: this._clusterId,
    url: 'https://charts.bitnami.com/bitnami',
  }, this._opts);

  public readonly chartCenter = new Catalog('chart-center', {
    url: 'https://repo.chartcenter.io',
  }, this._opts);

  public readonly chartCenterV2 = new CatalogV2('chart-center', {
    clusterId: this._clusterId,
    url: 'https://repo.chartcenter.io',
  }, this._opts);

  public readonly codecentric = new Catalog('codecentric', {
    url: 'https://codecentric.github.io/helm-charts',
  }, this._opts);

  public readonly codecentricV2 = new CatalogV2('codecentric', {
    clusterId: this._clusterId,
    url: 'https://codecentric.github.io/helm-charts',
  }, this._opts);

  public readonly community = new Catalog('rancher-community', {
    url: 'https://github.com/rancher/community-catalog',
  }, this._opts);

  public readonly communityV2 = new CatalogV2('rancher-community', {
    clusterId: this._clusterId,
    gitRepo: 'https://github.com/rancher/community-catalog',
  }, this._opts);

  public readonly helm = Catalog.get('helm', 'helm', undefined, this._opts);

  public readonly inlets = new Catalog('inlets', {
    url: 'https://inlets.github.io/inlets-operator',
  }, this._opts);

  public readonly jfrog = new Catalog('jfrog', {
    url: 'https://github.com/jfrog/charts',
  }, this._opts);

  public readonly jfrogV2 = new CatalogV2('jfrog', {
    clusterId: this._clusterId,
    gitRepo: 'https://github.com/jfrog/charts',
  }, this._opts);

  public readonly k8sAtHome = new Catalog('k8s-at-home', {
    url: 'https://k8s-at-home.com/charts/',
  }, this._opts);

  public readonly k8sAtHomeV2 = new CatalogV2('k8s-at-home', {
    clusterId: this._clusterId,
    url: 'https://k8s-at-home.com/charts/',
  }, this._opts);

  public readonly library = Catalog.get('library', 'library', undefined, this._opts);

  public readonly partners = CatalogV2.get('partners', 'rancher-partner-charts', this._state, this._opts);

  public readonly portainer = new CatalogV2('portainer', {
    clusterId: this._clusterId,
    url: 'https://portainer.github.io/k8s',
  }, this._opts);

  public readonly rancher = CatalogV2.get('rancher', 'rancher-charts', this._state, this._opts);

  public readonly traefik = new CatalogV2('traefik', {
    clusterId: this._clusterId,
    url: 'https://helm.traefik.io/traefik',
  }, this._opts);

  public readonly unstoppableMango = new Catalog('unstoppablemango', {
    url: this._githubRef.requireOutput('helmChartsRepoUrl'),
  }, this._opts);

  public readonly unstoppableMangoV2 = new CatalogV2('unstoppablemango', {
    clusterId: this._clusterId,
    gitRepo: this._githubRef.requireOutput('helmChartsRepoUrl'),
  }, this._opts);

  constructor(name: string, private _clusterId: Input<string>, opts?: ComponentResourceOptions) {
    super('unmango:rancher:Catalogs', name, undefined, opts);
  }

}
