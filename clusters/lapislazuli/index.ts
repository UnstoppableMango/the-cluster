import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as infra from '@unmango/thecluster-crds/infrastructure/v1alpha1';
import * as capi from '@unmango/thecluster-crds/cluster/v1beta1';
import { provider } from '@unmango/thecluster/cluster/management';
import { rbdStorageClass } from '@unmango/thecluster/storage';
import { cloudflare as cfIngress } from '@unmango/thecluster/ingress-classes';
import { requireProp, required, yamlStringify } from '@unmango/thecluster';
import { cluster, hosts, ports, versions } from './config';

const ns = new k8s.core.v1.Namespace(cluster, {
  metadata: { name: cluster },
}, { provider });

const vcluster = new infra.VCluster(cluster, {
  metadata: {
    name: cluster,
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
          services: { enabled: true },
          configmaps: {
            enabled: true,
            all: false,
          },
          secrets: {
            enabled: true,
            all: false,
          },
          endpoints: { enabled: true },
          pods: {
            enabled: true,
            ephemeralContainers: false,
            status: false,
          },
          events: { enabled: true },
          persistentvolumeclaims: { enabled: true },
          ingresses: { enabled: false },
          ingressclasses: { enabled: true },
          'fake-nodes': { enabled: true },
          'fake-persistentvolumes': { enabled: true },
          nodes: { enabled: false },
          persistentvolumes: { enabled: false },
          storageClasses: { enabled: true },
        },
        fallbackHostDns: true,
        mapServices: {
          fromVirtual: [],
          fromHost: [],
        },
        syncer: {
          image: 'ghcr.io/loft-sh/vcluster',
          kubeConfigContextName: 'lapis-lazuli',
        },
        vcluster: {
          image: `k0sproject/k0s:${versions.k0s}`,
          command: ['/k0s-binary/k0s'],
          baseArgs: [
            'controller',
            '--config=/etc/k0s/config.yaml',
            '--data-dir=/data/k0s',
          ],
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
          className: rbdStorageClass,
        },
        serviceAccount: {
          create: true,
        },
        replicas: 3,
        service: {
          type: 'ClusterIP',
          // loadBalancerIP: '',
          // loadBalancerClass: '',
        },
        ingress: {
          enabled: true,
          pathType: 'Prefix',
          ingressClassName: cfIngress,
          host: hosts.external,
          annotations: {
            'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'https',
            // 'cloudflare-tunnel-ingress-controller.strrl.dev/ssl-verify': 'false',
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
        // config: yamlStringify({}),
        coredns: {
          enabled: true,
          replicas: 1,
        },
      }),
    },
  },
}, { provider });

const thing = new capi.Cluster(cluster, {
  metadata: {
    name: cluster,
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
