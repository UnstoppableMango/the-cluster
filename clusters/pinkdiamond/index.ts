import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import * as cluster from '@pulumi/crds/cluster/v1beta1';
import * as bootstrap from '@pulumi/crds/bootstrap/v1alpha3';
import * as infra from '@pulumi/crds/infrastructure';
import * as controlPlane from '@pulumi/crds/controlplane/v1alpha3';
import * as addons from '@pulumi/crds/addons/v1beta1';
import ns from './namespace';
import { rpi4Md, pxApolloMd, pxZeusMd } from './machineTemplates';
import { configMap, secret } from './proxmox';
import { ControlPlaneConfig, Proxmox, Versions } from './types';

// const templatesRef = new pulumi.StackReference('templates', {
//   name: 'UnstoppableMango/thecluster-capi-templates/rosequartz',
// });

const config = new pulumi.Config();
const controlPlaneConfig = config.requireObject<ControlPlaneConfig>('controlPlane');
const versions = config.requireObject<Versions>('versions');
const proxmox = config.requireObject<Proxmox>('proxmox');

// TODO: Tunnel
// const publicEndpoint = new cloudflare.Record('pd.thecluster.io', {
//   name: 'pd.thecluster.io',
//   type: 'A',
//   zoneId: config.require('zoneId'),
//   proxied: false,
//   value: config.requireSecret('publicIp'),
// });

const commonLabels: Record<string, string> = {
  'cluster.x-k8s.io/cluster-name': config.require('clusterName'),
};

// Subject Alternative Names to use for certificates
const certSans = [
  config.require('primaryDnsName'),
  config.require('vip'),
];

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
      apiVersion: rpi4Md.apiVersion.apply(x => x ?? ''),
      kind: rpi4Md.kind.apply(x => x ?? ''),
      name: pulumi.output(rpi4Md.metadata).apply(x => x?.name ?? ''),
    },
  },
});

const talosBootstrap = new bootstrap.TalosConfigTemplate('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    template: {
      spec: {
        generateType: 'join',
        talosVersion: `v${versions.talos}`,
      },
    },
  },
});

const pxTmpl = new Map([['zeus', pxZeusMd], ['apollo', pxApolloMd]]);
const proxmoxDeployments = [...pxTmpl.entries()].map(([host, tmpl]) => new cluster.MachineDeployment(host, {
  metadata: {
    name: host,
    namespace: ns.metadata.name,
    labels: commonLabels,
  },
  spec: {
    clusterName: config.require('clusterName'),
    replicas: 2,
    selector: {
      matchLabels: commonLabels,
    },
    template: {
      metadata: {
        labels: commonLabels,
      },
      spec: {
        clusterName: config.require('clusterName'),
        bootstrap: {
          configRef: {
            apiVersion: talosBootstrap.apiVersion.apply(x => x ?? ''),
            kind: talosBootstrap.kind.apply(x => x ?? ''),
            name: pulumi.output(talosBootstrap.metadata).apply(x => x?.name ?? ''),
          },
        },
        infrastructureRef: {
          apiVersion: tmpl.apiVersion.apply(x => x ?? ''),
          kind: tmpl.kind.apply(x => x ?? ''),
          name: pulumi.output(tmpl.metadata).apply(x => x?.name ?? ''),
        },
      },
    },
  },
}));

const crs = new addons.ClusterResourceSet('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    clusterSelector: {
      matchLabels: commonLabels,
    },
    resources: [{
      kind: configMap.kind,
      name: configMap.metadata.name,
    }],
    strategy: 'Reconcile',
  },
});

const proxmoxCluster = new infra.v1beta1.ProxmoxCluster('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    controlPlaneEndpoint: {
      host: config.require('vip'),
      port: 6443,
    },
    serverRef: {
      endpoint: proxmox.endpoint,
      secretRef: {
        name: secret.metadata.name,
      },
    },
    storage: {
      name: 'local',
      path: '/var/lib/vz',
    },
  },
});

const metalCluster = new infra.v1alpha3.MetalCluster('pinkdiamond', {
  metadata: {
    name: 'pinkdiamond',
    namespace: ns.metadata.name,
  },
  spec: {
    controlPlaneEndpoint: {
      host: config.require('vip'),
      port: 6443,
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
      apiVersion: metalCluster.apiVersion.apply(x => x ?? ''),
      kind: metalCluster.kind.apply(x => x ?? ''),
      name: pulumi.output(metalCluster.metadata).apply(x => x?.name ?? ''),
    },
  },
});
