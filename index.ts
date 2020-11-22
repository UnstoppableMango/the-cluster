import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { Catalogs, OperatorStacks, Utils } from './resources';

const config = new pulumi.Config();

const cluster = new rancher.Cluster('the-cluster', {
  name: 'the-cluster',
  rkeConfig: {
    kubernetesVersion: 'v1.19.4-rancher1-1',
    services: {
      kubelet: {
        // Hopefully should ensure consistency across nodes
        extraArgs: { 'root-dir': '/var/lib/kubelet' },
        // Above is apparently not enough to provide consistency across nodes
        extraBinds: ['/var/lib/kubelet:/var/lib/kubelet:shared,z'],
      },
    },
  },
});

const k8sProvider = new k8s.Provider('the-cluster', {
  kubeconfig: cluster.kubeConfig,
});

const {
  bitnami, bitnamiV2,
  chartCenter, chartCenterV2,
  codecentric, codecentricV2,
  helm,
  k8sAtHome, k8sAtHomeV2,
  library,
  partners,
  rancher: rancherCatalog,
  unstoppableMango, unstoppableMangoV2,
} = new Catalogs('catalogs', cluster.id);

const stacks = new OperatorStacks('the-cluster', { provider: k8sProvider });

const utils = new Utils('github');

export const kubeconfig = pulumi.secret(cluster.kubeConfig);
export const clusterId = cluster.id;

export const defaultProjectId = cluster.defaultProjectId;
export const systemProjectId = cluster.systemProjectId;

export const bitnamiCatalogId = bitnami.id;
export const bitnamiV2CatalogId = bitnamiV2.id;
export const chartCenterCatalogId = chartCenter.id;
export const chartCenterV2CatalogId = chartCenterV2.id;
export const codecentricCatalogId = codecentric.id;
export const codecentricV2CatalogId = codecentricV2.id;
export const helmCatalogId = helm.id;
export const k8sAtHomeCatalogId = k8sAtHome.id;
export const k8sAtHomeV2CatalogId = k8sAtHomeV2.id;
export const libraryCatalogId = library.id;
export const partnersCatalogId = partners.id;
export const rancherCatalogId = rancherCatalog.id;
export const unstoppableMangoCatalogId = unstoppableMango.id;
export const unstoppableMangoV2CatalogId = unstoppableMangoV2.id;
