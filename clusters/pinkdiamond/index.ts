import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import * as cluster from '@pulumi/crds/cluster/v1beta1';
import * as infra from '@pulumi/crds/infrastructure';
import * as metal from '@pulumi/crds/metal/v1alpha2';
import * as controlPlane from '@pulumi/crds/controlplane/v1alpha3';
import { Node, Versions } from './types';

const templatesRef = new pulumi.StackReference('templates', {
  name: 'UnstoppableMango/thecluster-capi-templates/rosequartz',
});

const config = new pulumi.Config();
const controlPlaneConfig = config.requireObject<ControlPlaneConfig>('controlPlane');
const versions = config.requireObject<Versions>('versions');
const proxmox = config.requireObject<Proxmox>('proxmox');

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

const controlPlaneTemplate = templatesRef.requireOutput('rp4.md') as pulumi.Output<infra.v1alpha3.MetalMachineTemplate>;

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

const proxmoxCluster = new infra.v1beta1.ProxmoxCluster('pinkdiamond', {
  metadata: {
    name: 'pink-diamond',
    namespace: ns.metadata.name,
  },
  spec: {
    serverRef: {
      endpoint: proxmox.endpoint,
      secretRef: {
        name: '', // TODO
      },
    },
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
      apiVersion: proxmoxCluster.apiVersion.apply(x => x ?? ''),
      kind: proxmoxCluster.kind.apply(x => x ?? ''),
      name: pulumi.output(proxmoxCluster.metadata).apply(x => x?.name ?? ''),
    },
  },
});
