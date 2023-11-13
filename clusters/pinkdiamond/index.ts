import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import * as cluster from '@pulumi/crds/cluster/v1beta1';
import * as infra from '@pulumi/crds/infrastructure/v1alpha3';
import * as metal from '@pulumi/crds/metal/v1alpha2';
import * as controlPlane from '@pulumi/crds/controlplane/v1alpha3';
import * as serverClasses from './serverClasses';
import { ControlPlaneConfig, Versions } from './types';

const config = new pulumi.Config();
const controlPlaneConfig = config.requireObject<ControlPlaneConfig>('controlPlane');
const versions = config.requireObject<Versions>('versions');

const commonLabels: Record<string, string> = {
  'cluster.x-k8s.io/cluster-name': config.require('clusterName'),
};

// TODO: Tunnel
const publicEndpoint = new cloudflare.Record('pd.thecluster.io', {
  name: 'pd.thecluster.io',
  type: 'A',
  zoneId: config.require('zoneId'),
  proxied: false,
  value: config.requireSecret('publicIp'),
});

const ns = new k8s.core.v1.Namespace('pinkdiamond', {
  metadata: { name: 'pinkdiamond' },
});

// Subject Alternative Names to use for certificates
const certSans = [
  // // The first in the array seems to get ignored for some reason, so we add it twice
  // config.require('localIp'),
  config.require('localIp'),
  config.require('primaryDnsName'),
  config.require('vip'),
];

const metalCluster = new infra.MetalCluster('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    controlPlaneEndpoint: {
      host: controlPlaneConfig.endpoint,
      port: controlPlaneConfig.port,
    },
  },
});

const controlPlaneTemplate = new infra.MetalMachineTemplate('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        serverClassRef: {
          apiVersion: serverClasses.rosequartz.apiVersion.apply(x => x ?? ''),
          kind: serverClasses.rosequartz.kind.apply(x => x ?? ''),
          name: pulumi.output(serverClasses.rosequartz.metadata).apply(x => x?.name ?? ''),
        },
      },
    },
  },
});

const talosControlPlane = new controlPlane.TalosControlPlane('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    version: `v${versions.k8s}`,
    replicas: controlPlaneConfig.machineCount,
    controlPlaneConfig: {
      controlplane: {
        generateType: 'controlplane',
        talosVersion: `v${versions.talos}`,
        configPatches: [{
          op: 'replace',
          path: '/cluster/extraManifests',
          value: [
            `https://raw.githubusercontent.com/alex1989hu/kubelet-serving-cert-approver/v${versions.ksca}/deploy/standalone-install.yaml`,
          ],
        }, {
          op: 'replace',
          path: '/cluster/apiServer/certSANs',
          value: certSans,
        }, {
          op: 'replace',
          path: '/machine/certSANs',
          value: certSans,
        }, {
          op: 'add',
          path: '/machine/kubelet/extraArgs',
          value: {
            'rotate-server-certificates': true,
          },
        }, {
          op: 'add',
          path: '/machine/network',
          value: {
            interfaces: [{
              deviceSelector: {
                hardwareAddr: 'd8:3a:dd:*',
              },
              dhcp: true,
              vip: {
                ip: config.require('vip'),
              },
            }],
          },
        }],
      },
    },
    infrastructureTemplate: {
      apiVersion: controlPlaneTemplate.apiVersion.apply(x => x ?? ''),
      kind: controlPlaneTemplate.kind.apply(x => x ?? ''),
      name: pulumi.output(controlPlaneTemplate.metadata).apply(x => x?.name ?? ''),
    },
  },
});

const mixedClusterClass = new cluster.ClusterClass('mixed-v0.1.0', {
  metadata: {
    name: 'mixed-v0.1.0',
    namespace: ns.metadata.name,
  },
});

const pinkdiamondCluster = new cluster.Cluster('pinkdiamond', {
  metadata: {
    name: config.require('clusterName'),
    namespace: ns.metadata.name,
    labels: commonLabels,
  },
  spec: {
    clusterNetwork: {
      pods: {
        cidrBlocks: ['10.244.0.0/16'],
      },
      services: {
        cidrBlocks: ['10.96.0.0/12'],
      },
    },
    controlPlaneRef: {
      apiVersion: talosControlPlane.apiVersion.apply(x => x ?? ''),
      kind: talosControlPlane.kind.apply(x => x ?? ''),
      name: pulumi.output(talosControlPlane.metadata).apply(x => x?.name ?? ''),
    },
    infrastructureRef: {
      apiVersion: metalCluster.apiVersion.apply(x => x ?? ''),
      kind: metalCluster.kind.apply(x => x ?? ''),
      name: pulumi.output(metalCluster.metadata).apply(x => x?.name ?? ''),
    },
  },
});
