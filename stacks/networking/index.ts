import * as pulumi from '@pulumi/pulumi';
import * as rancher from '@pulumi/rancher2';
import * as yaml from 'yaml';
import { getTheCluster, getTheClusterRef, getRancherRef } from '@unmango/shared';
import { Traefik } from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const {
  k8sProvider,
  rancherProvider,
  theCluster,
  defaultProject,
  systemProject,
  catalogs: {
    bitnami: bitnamiCatalog,
  },
} = getTheCluster({
  theClusterRef: getTheClusterRef(remoteStack),
  rancherRef: getRancherRef(remoteStack),
});

const metallbNs = new rancher.Namespace('metallb', {
  name: 'metallb-system',
  projectId: defaultProject.id,
}, { provider: rancherProvider });

const metallb = new rancher.App('metallb', {
  projectId: defaultProject.id,
  catalogName: bitnamiCatalog.name,
  templateName: 'metallb',
  templateVersion: '2.1.2',
  targetNamespace: metallbNs.id,
  forceUpgrade: true,
  answers: {
    configInline: yaml.stringify({
      'address-pools': [{
        name: 'default',
        protocol: 'layer2',
        addresses: ['192.168.1.75-192.168.1.99'],
      }],
    }).trimEnd(),
  },
}, { provider: rancherProvider });

// const cloudflareConfig = new pulumi.Config('cloudflare');

// const cloudflareSecret = new rancher.Secret('cloudflare', {
//   projectId: systemProject.id,
//   namespaceId: kubeSystemNs.id,
//   data: {
//     CLOUDFLARE_API_KEY: cloudflareConfig.requireSecret('apiKey').apply(base64.encode),
//     CLOUDFLARE_EMAIL: cloudflareConfig.requireSecret('email').apply(base64.encode),
//   },
// }, { provider: rancherProvider });

const traefikValues = pulumi.all({
  id: theCluster.id,
  name: theCluster.name,
}).apply(({ id, name }) => yaml.stringify({
  global: {
    cattle: {
      clusterId: id,
      clusterName: name,
    },
  },
  persistence: { enabled: true },
  ports: { traefik: { expose: true } },
}));

const traefik = new Traefik('traefik', {
  clusterId: theCluster.id,
  projectId: defaultProject.id,
}, { providers: [rancherProvider, k8sProvider] });
