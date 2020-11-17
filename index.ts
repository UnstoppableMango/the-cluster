import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import { Catalogs, OperatorStacks } from './resources';

const config = new pulumi.Config();

const cluster = new rancher.Cluster('the-cluster', {
  name: 'the-cluster',
  rkeConfig: {
    kubernetesVersion: 'v1.19.4-rancher1-1',
    services: {
      kubelet: {
        // Hopefully should ensure consistency across nodes
        extraArgs: { 'root-dir': '/var/lib/kubelet'},
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
  bitnami,
  codecentric,
  k8sAtHome,
  library,
  portainer,
  traefik,
  unstoppableMango,
} = new Catalogs('catalogs', cluster.id);
const stacks = new OperatorStacks('the-cluster', { provider: k8sProvider });

export const kubeconfig = pulumi.secret(cluster.kubeConfig);
export const clusterId = cluster.id;

export const defaultProjectId = cluster.defaultProjectId;
export const systemProjectId = cluster.systemProjectId;

export const bitnamiCatalogId = bitnami.id;
export const codecentricCatalogId = codecentric.id;
export const k8sAtHomeCatalogId = k8sAtHome.id;
export const libraryCatalogId = library.id;
export const portainerCatalogId = portainer.id;
export const traefikCatalogId = traefik.id;
export const unstoppableMangoCatalogId = unstoppableMango.id;
