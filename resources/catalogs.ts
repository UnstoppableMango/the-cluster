import { ComponentResource, ComponentResourceOptions, Input, StackReference } from '@pulumi/pulumi';
import { Catalog, CatalogV2 } from '@pulumi/rancher2';

export class Catalogs extends ComponentResource {

  private readonly _opts = { parent: this };

  private readonly _githubRef = new StackReference(
    'UnstoppableMango/github-unstoppablemango/prod',
    undefined,
    this._opts,
  );

  public readonly bitnami = new Catalog('bitnami', {
    url: 'https://charts.bitnami.com/bitnami',
  }, this._opts);

  public readonly codecentric = new Catalog('codecentric', {
    url: 'https://codecentric.github.io/helm-charts',
  }, this._opts);

  public readonly community = new Catalog('rancher-community', {
    url: 'https://github.com/rancher/community-catalog',
  }, this._opts);

  public readonly inlets = new Catalog('inlets', {
    url: 'https://inlets.github.io/inlets-operator',
  }, this._opts);

  public readonly jfrog = new Catalog('jfrog', {
    url: 'https://github.com/jfrog/charts',
  }, this._opts);

  public readonly k8sAtHome = new CatalogV2('k8s-at-home', {
    clusterId: this._clusterId,
    url: 'https://k8s-at-home.com/charts/',
  }, this._opts);

  public readonly library = Catalog.get('library', 'library');

  public readonly portainer = new CatalogV2('portainer', {
    clusterId: this._clusterId,
    url: 'https://portainer.github.io/k8s',
  }, this._opts);

  public readonly traefik = new CatalogV2('traefik', {
    clusterId: this._clusterId,
    url: 'https://helm.traefik.io/traefik',
  }, this._opts);

  public readonly unstoppableMango = new Catalog('unstoppablemango', {
    url: this._githubRef.requireOutput('helmChartsRepoUrl'),
  }, this._opts);

  constructor(name: string, private _clusterId: Input<string>, opts?: ComponentResourceOptions) {
    super('unmango:rancher:Catalogs', name, undefined, opts);
  }

}
