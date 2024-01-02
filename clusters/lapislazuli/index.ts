import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as infra from '@unstoppablemango/thecluster-crds/infrastructure/v1alpha1';
import * as capi from '@unstoppablemango/thecluster-crds/cluster/v1beta1';
import { ingresses, loadBalancers, provider, storageClasses } from '@unstoppablemango/thecluster/cluster/pinkdiamond';
import { system as rosequartz } from '@unstoppablemango/thecluster/cluster/rosequartz';
import { system as pinkdiamond } from '@unstoppablemango/thecluster/cluster/pinkdiamond';
import { required, yamlStringify } from '@unstoppablemango/thecluster';
import { cluster as clusterName, hosts, ip, ports, versions } from './config';
import { System } from '@unstoppablemango/thecluster/internal';

const ns = new k8s.core.v1.Namespace(clusterName, {
  metadata: { name: clusterName },
}, { provider });

function certOut(s: System): pulumi.Output<pulumi.Output<string>[]> {
  return s.ref.requireOutput('certSans') as pulumi.Output<pulumi.Output<string>[]>;
}

const certSans = pulumi
  .all([
    certOut(rosequartz),
    certOut(pinkdiamond),
  ])
  .apply(([r, p]) => {
    return [
      ...r,
      ...p,
      ...hosts.aliases.external,
      ...hosts.aliases.internal,
      hosts.external,
      hosts.internal,
      ip,
      // Crap I need to add to the actual clusters at some point
      'pinkdiamond.thecluster.io',
      'pink.thecluster.io',
      'pinkdiamond.lan.thecluster.io',
      'pink.lan.thecluster.io',
      'pd.lan.thecluster.io',
      'rosequartz.thecluster.io',
      'rose.thecluster.io',
      'rosequartz.lan.thecluster.io',
      'rose.lan.thecluster.io',
      'rq.lan.thecluster.io',
    ];
  });

const vcluster = new infra.VCluster(clusterName, {
  metadata: {
    name: clusterName,
    namespace: ns.metadata.name,
  },
  spec: {
    kubernetesVersion: versions.k8s,
    controlPlaneEndpoint: {
      host: hosts.external,
      port: ports.external,
    },
    // https://github.com/loft-sh/vcluster/tree/main/charts
    helmRelease: {
      chart: {
        repo: 'https://charts.loft.sh',
        // Corresponds to the helm chart used
        name: 'vcluster-k0s',
        version: versions.vcluster,
      },
      // https://github.com/loft-sh/vcluster/blob/main/charts/k0s/values.yaml
      values: yamlStringify({
        headless: false,
        sync: {
          // Defaults:
          // services: { enabled: true },
          // configmaps: {
          //   enabled: true,
          //   all: false,
          // },
          // secrets: {
          //   enabled: true,
          //   all: false,
          // },
          // endpoints: { enabled: true },
          // pods: {
          //   enabled: true,
          //   ephemeralContainers: false,
          //   status: false,
          // },
          // events: { enabled: true },
          // persistentvolumeclaims: { enabled: true },
          // ingresses: { enabled: false },
          // ingressclasses: { enabled: false },
          // 'fake-nodes': { enabled: true },
          // 'fake-persistentvolumes': { enabled: true },
          // nodes: { enabled: false },
          // persistentvolumes: { enabled: false },
          // storageClasses: { enabled: false },
        },
        // Not sure if I want to spin up another DNS server for THECLUSTER or not...
        // fallbackHostDns: true,
        mapServices: {
          fromVirtual: [],
          fromHost: [],
        },
        proxy: {
          metricsServer: {
            nodes: { enabled: true },
            pods: { enabled: true },
          },
        },
        syncer: {
          image: 'ghcr.io/loft-sh/vcluster',
          resources: {
            requests: {
              'ephemeral-storage': '8Gi',
              memory: '2Gi',
            },
            limits: {
              'ephemeral-storage': '200Mi',
              cpu: '10m',
              memory: '64Mi',
            },
          },
          kubeConfigContextName: clusterName,
        },
        vcluster: {
          image: `k0sproject/k0s:${versions.k0s}`,
          extraArgs: [],
          resources: {
            limits: {
              memory: '2Gi',
            },
            requests: {
              cpu: '200m',
              memory: '256Mi',
            },
          },
        },
        storage: {
          persistence: true,
          size: '15Gi',
          className: storageClasses.rbd,
        },
        serviceAccount: {
          create: true,
        },
        replicas: 3,
        autoDeletePersistentVolumeClaims: true,
        affinity: {}, // Something to select the pi's
        tolerations: [], // Tolerate the pi's
        priorityClassName: 'system-clutser-critical',
        service: {
          type: 'LoadBalancer',
          loadBalancerIP: ip,
          loadBalancerClass: loadBalancers.metallb,
        },
        ingress: {
          enabled: true,
          pathType: 'Prefix',
          ingressClassName: ingresses.cloudflare,
          host: hosts.external,
          annotations: {
            'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'https',
            'pulumi.com/skipAwait': 'true',
          },
        },
        securityContext: {
          allowPrivilegeEscalation: false,
          capabilities: { drop: ['ALL'] },
          readOnlyRootFilesystem: true,
          runAsUser: 1001,
          runAsGroup: 1001,
          runAsNonRoot: true,
        },
        config: yamlStringify({
          apiVersion: 'k0s.k0sproject.io/v1beta1',
          kind: 'ClusterConfig',
          metadata: {
            name: clusterName,
          },
          spec: {
            api: {
              address: ip,
              externalAddress: hosts.external,
              // k0sApiPort: port, // TODO: I think
              // port: port, // TODO: I think
              sans: certSans,
            },
          },
        }),
        coredns: {
          enabled: true,
          replicas: 2,
          image: pulumi.interpolate`coredns/coredns:${versions.coreDns}`,
          // config: pulumi.interpolate``, // TODO
          service: {
            type: 'ClusterIP',
          },
          resources: {
            limits: {
              cpu: '1000m',
              memory: '512Mi',
            },
            requests: {
              cpu: '20m',
              memory: '64Mi',
            },
          },
        },
        // https://github.com/loft-sh/vcluster/blob/52581de84156b35615afb134ab7e8e992da8d97a/charts/k0s/values.yaml#L407-L461
        isolation: { enabled: false }, // Maybe I want this?
        multiNamespaceMode: { enabled: false },
        // Sneaky sneaky
        telemetry: { disabled: true },
      }),
    },
  },
}, { provider });

const cluster = new capi.Cluster(clusterName, {
  metadata: {
    name: clusterName,
    namespace: ns.metadata.name,
  },
  spec: {
    infrastructureRef: {
      apiVersion: vcluster.apiVersion.apply(required),
      kind: vcluster.kind.apply(required),
      name: pulumi.output(vcluster.metadata).apply(x => x?.name ?? ''),
    },
    controlPlaneRef: {
      apiVersion: vcluster.apiVersion.apply(required),
      kind: vcluster.kind.apply(required),
      name: pulumi.output(vcluster.metadata).apply(x => x?.name ?? ''),
    },
  },
}, { provider });
