import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { ingressClass } from '@unmango/thecluster/apps/cloudflare-ingress';
import { rbdStorageClass } from '@unmango/thecluster/apps/ceph-csi';
import { github } from './config';

const rpcToken = new random.RandomId('rpc', {
  byteLength: 64,
});

const ns = new k8s.core.v1.Namespace('drone', {
  metadata: { name: 'drone' },
}, { provider });

const rpcSecret = new k8s.core.v1.Secret('rpc', {
  metadata: {
    name: 'rpd',
    namespace: ns.metadata.name,
  },
  stringData: {
    // IDFK
  },
}, { provider });

const chart = new k8s.helm.v3.Chart('drone', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    drone: {
      ingress: {
        enabled: true,
        className: ingressClass,
        hosts: [{
          host: 'drone.thecluster.io',
          paths: [{
            path: '/',
            pathType: 'Prefix',
          }],
        }],
      },
      persistentVolume: {
        storageClass: rbdStorageClass,
      },
      env: {
        DRONE_SERVER_HOST: 'drone.thecluster.io',
        DRONE_SERVER_PROTO: 'https',
        // ## REQUIRED: Set the secret secret token that the Drone server and its Runners will use
        // ## to authenticate. This is commented out in order to leave you the ability to set the
        // ## key via a separately provisioned secret (see existingSecretName above).
        // ## Ref: https://docs.drone.io/installation/reference/drone-rpc-secret/
        DRONE_RPC_SECRET: rpcToken.b64Std,
        DRONE_GITHUB_CLIENT_ID: github.clientId,
        DRONE_GITHUB_CLIENT_SECRET: github.clientSecret,
      },
    },
  },
}, { provider });
