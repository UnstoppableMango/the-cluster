import { interpolate } from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { S3Bucket } from '@pulumi/minio';
import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Release } from '@pulumi/kubernetes/helm/v3';
import { clusterIssuers, provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { backblaze, minioAccessKey, minioSecretKey, versions } from './config';
import { join } from '@unstoppablemango/thecluster';

const backupBucket = new S3Bucket('backup', { bucket: 'velero-backup' });
const minioCredentialsKey = 'minio-credentials';
const backblazeCredentialsKey = 'backblaze-credentials';

const ns = Namespace.get('velero', 'velero', { provider });

const config = new ConfigMap('velero', {
  metadata: {
    name: 'velero',
    namespace: ns.metadata.name,
  },
  data: {
  },
}, { provider });

const secret = new Secret('velero', {
  metadata: {
    name: 'velero',
    namespace: ns.metadata.name,
  },
  stringData: {
    [minioCredentialsKey]: join([
      '[default]',
      `aws_access_key_id=${minioAccessKey}`,
      `aws_secret_access_key=${minioSecretKey}\n`,
    ], '\n'),
    [backblazeCredentialsKey]: join([
      '[default]',
      `aws_access_key_id=${backblaze.accessKey}`,
      `aws_secret_access_key=${backblaze.applicationKey}\n`,
    ], '\n'),
  },
}, { provider });

const chart = new Release('velero', {
  chart: './',
  namespace: ns.metadata.name,
  createNamespace: false,
  skipCrds: false,
  atomic: true,
  dependencyUpdate: true,
  values: {
    // https://github.com/vmware-tanzu/helm-charts/blob/main/charts/velero/values.yaml
    velero: {
      image: {
        repository: 'velero/velero',
        tag: versions.velero,
      },
      resources: {
        requests: {
          cpu: '500m',
          memory: '128Mi',
        },
        limits: {
          cpu: '1000m',
          memory: '512Mi',
        },
      },
      upgradeJobResources: {
        requests: {
          cpu: '50m',
          memory: '128Mi',
        },
        limits: {
          cpu: '100m',
          memory: '256Mi',
        },
      },
      initContainers: [
        {
          name: 'velero-plugin-for-csi',
          image: `velero/velero-plugin-for-csi:${versions.veleroCsi}`,
          volumeMounts: [{
            mountPath: '/target',
            name: 'plugins',
          }],
        },
        {
          name: 'velero-plugin-for-aws',
          image: `velero/velero-plugin-for-aws:${versions.veleroAws}`,
          volumeMounts: [{
            mountPath: '/target',
            name: 'plugins',
          }],
        },
      ],
      podSecurityContext: {
        fsGroup: 1001,
      },
      containerSecurityContext: {
        allowPrivilegeEscalation: false,
        capabilities: { drop: ['ALL'] },
        readOnlyRootFilesystem: true,
      },
      extraVolumes: [{
        name: 'root-ca',
        configMap: {
          name: 'root-ca',
        },
      }],
      // The default bundle isn't included in here so the container fails to verify normal certs like backblaze
      // extraVolumeMounts: [{
      //   name: 'root-ca',
      //   mountPath: '/etc/ssl/certs',
      //   readOnly: true,
      // }],
      kubectl: {
        image: {
          repository: 'docker.io/bitnami/kubectl',
          tag: versions.bitnamiKubectl,
        },
      },
      configuration: {
        backupStorageLocation: [
          {
            name: 'minio',
            provider: 'aws',
            bucket: backupBucket.bucket,
            // caCert: '', // TODO: How to get this in b64 in the values?
            default: true,
            // validationFrequency: '',
            credential: {
              name: secret.metadata.name,
              key: minioCredentialsKey,
            },
            config: {
              region: 'goodall-apt',
              s3Url: 'http://thecluster-hl.minio.svc.cluster.local:9000',
              publicUrl: 'https://s3.thecluster.io',
            },
          },
          {
            name: 'backblaze',
            provider: 'aws',
            bucket: backblaze.bucketName,
            default: false,
            validationFrequency: '1h',
            credential: {
              name: secret.metadata.name,
              key: backblazeCredentialsKey,
            },
            config: {
              region: 'us-west-002',
              s3Url: 'https://s3.us-west-002.backblazeb2.com',
              publicUrl: 'https://s3.us-west-002.backblazeb2.com',
            },
          },
        ],
        volumeSnapshotLocation: [],
        namespace: ns.metadata.name,
      },
      snapshotsEnabled: false,
      schedules: {
        backblaze: {
          disabled: false,
          labels: {
            cluster: 'pinkdiamond',
          },
          schedule: '0 4 * * *',
          useOwnerReferencesInBackup: true,
          template: {
            ttl: '240h',
            storageLocation: 'backblaze',
            // includeNamespaces: [],
          },
        },
        minio: {
          disabled: true,
          labels: {
            cluster: 'pinkdiamond',
          },
          schedule: '0 * * * *',
          useOwnerReferencesInBackup: true,
          template: {
            ttl: '240h',
            storageLocation: 'backblaze',
            // includeNamespaces: [],
          },
        },
      },
    },
  },
}, { provider });
