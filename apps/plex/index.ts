import * as path from 'node:path';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { ConfigMap, Namespace } from '@pulumi/kubernetes/core/v1';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { clusterIssuers, databases, ingresses, provider, shared, storageClasses } from '@unstoppablemango/thecluster/cluster/from-stack';
import { claimToken, hosts, versions } from './config';
import { required } from '@unstoppablemango/thecluster/util';
import {CustomResourceOptions} from '@pulumi/pulumi';

const ns = Namespace.get('media', shared.namespaces.media, { provider });

// const cert = new Certificate('plex', {
//   metadata: {
//     name: 'plex',
//     namespace: ns.metadata.name,
//   },
//   spec: {
//     secretName: 'plex-tls',
//     issuerRef: clusterIssuers.ref(x => x.plex),
//     duration: '2160h0m0s', // 90d
//     renewBefore: '360h0m0s', // 15d
//     commonName: 'kc.thecluster.io',
//     subject: {
//       organizations: ['unmango'],
//     },
//     // TODO: Verify these will work
//     privateKey: {
//       algorithm: 'ECDSA',
//       size: 256,
//       rotationPolicy: 'Always',
//     },
//     usages: [
//       'server auth',
//       'client auth',
//     ],
//     dnsNames: [
//       hosts.external,
//       ...hosts.aliases.external,
//       hosts.internal,
//       ...hosts.aliases.internal,
//     ],
//   },
// }, { provider });

// const config = new ConfigMap('plex', {
//   metadata: {
//     name: 'plex',
//     namespace: ns.metadata.name,
//   },
//   data: {
//   },
// }, { provider });

// const secret = new k8s.core.v1.Secret('plex', {
//   metadata: {
//     name: 'plex',
//     namespace: ns.metadata.name,
//   },
//   stringData: {
//   },
// }, { provider });

const chart = new k8s.helm.v3.Chart('plex', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    // https://github.com/ressu/kube-plex/blob/main/charts/kube-plex/values.yaml
    'kube-plex': {
      image: {
        repository: 'plexinc/pms-docker',
        tag: versions.plex,
      },
      kubePlex: {
        image: {
          repository: 'ghcr.io/ressu/kube-plex',
          tag: versions.kubePlex,
        },
        // resources: {},
      },
      claimToken,
      timezone: 'America/Chicago',
      extraEnv: {
        puid: 1001,
        pgid: 1001,
        // NVIDIA_VISIBLE_DEVICES: 'all',
        // NVIDIA_DRIVER_CAPABILITIES: 'video,compute,utility',
      },
      // runtimeClassName: 'nvidia',
      service: { type: 'ClusterIP', port: 32400 },
      ingress: {
        enabled: true,
        hosts: ['plex.thecluster.io'],
        annotations: {
          'pulumi.com/skipAwait': 'true',
        },
      },
      persistence: {
        transcode: {
          enabled: true,
          storageClass: storageClasses.cephfs,
          size: '100Gi',
          accessMode: 'ReadWriteMany',
        },
        data: {
          storageClass: storageClasses.rbd,
          size: '100Gi',
          accessMode: 'ReadWriteOnce',
        },
        extraData: ['movies', 'tv', 'anime', 'music', 'movies4k', 'tv4k', 'photos'].map(x => ({
          claimName: x,
          name: x,
        })),
        config: {
          claimName: 'plex',
          subPath: 'plex',
          accessMode: 'ReadWriteMany',
        },
      },
      // proxy: {
      //   https: 'https://plex.thecluster.io',
      // },
      // resources: {},
    },
  },
  transformations: [
    (obj: any, opts: CustomResourceOptions) => {
      if (obj.kind !== 'Deployment') return;
      const container = obj.spec.template.spec.containers[0];
      container.ports = container.ports.filter((x: any) => {
        return x.name !== 'http';
      });
      // obj.spec.template.spec.dnsConfig = {
      //   nameservers: ['1.1.1.1'],
      //   // options: [{ name: 'ndots', value: '0' }],
      // };
    },
    (obj: any, opts: CustomResourceOptions) => {
      if (obj.kind !== 'Ingress') return;
      obj.spec.ingressClassName = ingresses.cloudflare;
      const paths = obj.spec.rules[0].http.paths;
      paths[0].pathType = 'Prefix';
    },
  ],
}, { provider });

export { hosts };
