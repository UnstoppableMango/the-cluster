import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';

type CatalogUnion =
  | rancher.Catalog
  | rancher.CatalogV2;

type GetCatalog<T extends CatalogUnion> = (
  name: string,
  id: pulumi.Input<string>,
  state?: rancher.CatalogState | rancher.CatalogV2State,
  opts?: pulumi.CustomResourceOptions,
) => T;

export interface Catalogs {
  bitnami: rancher.Catalog;
  bitnamiV2: rancher.CatalogV2;
  chartCenter: rancher.Catalog;
  chartCenterV2: rancher.CatalogV2;
  codecentric: rancher.Catalog;
  codecentricV2: rancher.CatalogV2;
  // helm: rancher.Catalog;
  k8sAtHome: rancher.Catalog;
  k8sAtHomeV2: rancher.CatalogV2;
  library: rancher.Catalog;
  partners: rancher.CatalogV2;
  rancher: rancher.CatalogV2;
}

// export type CatalogsExport<T = Catalogs> = {
//   [P in keyof T as `${string & P}Id`]: pulumi.Output<string>
// };

// export const createExport = (catalogs: Catalogs): CatalogsExport => ({
//   bitnamiId: catalogs.bitnami.id,
//   bitnamiV2Id: catalogs.bitnamiV2.id,
//   chartCenterId: catalogs.chartCenter.id,
//   chartCenterV2Id: catalogs.chartCenterV2.id,
//   codecentricId: catalogs.codecentric.id,
//   codecentricV2Id: catalogs.codecentricV2.id,
//   k8sAtHomeId: catalogs.k8sAtHome.id,
//   k8sAtHomeV2Id: catalogs.k8sAtHomeV2.id,
//   libraryId: catalogs.library.id,
//   partnersId: catalogs.partners.id,
//   rancherId: catalogs.rancher.id,
//   unstoppableMangoId: catalogs.unstoppableMango.id,
//   unstoppableMangoV2Id: catalogs.unstoppableMangoV2.id
// });

export const getCatalogs = (
  clusterId: pulumi.Input<string>,
  ref: pulumi.StackReference,
  provider: pulumi.ProviderResource): Catalogs => {

  const getCatalogGetter = <T extends CatalogUnion>(callback: GetCatalog<T>) => (name: string) => callback(
    name,
    ref.requireOutput(`${name}CatalogId`),
    { clusterId },
    { provider },
  );
  const getCatalog = getCatalogGetter(rancher.Catalog.get);
  const getCatalogV2 = getCatalogGetter(rancher.CatalogV2.get);

  return {
    bitnami: getCatalog('bitnami'),
    bitnamiV2: getCatalogV2('bitnamiV2'),
    chartCenter: getCatalog('chartCenter'),
    chartCenterV2: getCatalogV2('chartCenterV2'),
    codecentric: getCatalog('codecentric'),
    codecentricV2: getCatalogV2('codecentricV2'),
    // helm: getCatalog('helm'),
    k8sAtHome: getCatalog('k8sAtHome'),
    k8sAtHomeV2: getCatalogV2('k8sAtHomeV2'),
    library: getCatalog('library'),
    partners: getCatalogV2('partners'),
    rancher: getCatalogV2('rancher'),
  };
};
