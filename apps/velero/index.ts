import { all, Input } from '@pulumi/pulumi';
import { ConfigMap, Secret } from '@pulumi/kubernetes/core/v1';
import { Release } from '@pulumi/kubernetes/helm/v3';
import { backblaze, versions } from './config';

const backblazeCredentialsKey = 'backblaze-credentials';

const config = new ConfigMap('velero', {
  metadata: { namespace: 'velero' },
  data: {},
});

const secret = new Secret('velero', {
  metadata: { namespace: 'velero' },
  stringData: {
    [backblazeCredentialsKey]: join([
      '[default]',
      `aws_access_key_id=${backblaze.accessKey}`,
      `aws_secret_access_key=${backblaze.applicationKey}\n`,
    ], '\n'),
  },
});

const chart = new Release('velero', {
  chart: './',
  namespace: 'velero',
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
      // extraVolumes: [{
      //   name: 'root-ca',
      //   configMap: {
      //     name: 'root-ca',
      //   },
      // }],
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
        namespace: 'velero',
      },
      snapshotsEnabled: false,
      schedules: {
        backblaze: {
          disabled: true,
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
      },
    },
  },
});

function join(inputs: Input<string>[], sep: string): Input<string> {
  return all(inputs).apply(x => x.join(sep));
}
