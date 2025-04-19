import { StatefulSet } from '@pulumi/kubernetes/apps/v1';
import { Namespace, PersistentVolumeClaim, Service, ServiceSpecType } from '@pulumi/kubernetes/core/v1';

const ns = new Namespace('slackpack', {
  metadata: { name: 'slackpack' },
});

const svc = new Service('server', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    type: ServiceSpecType.LoadBalancer,
    selector: {
      'app.kubernetes.io/name': 'slackpack',
    },
    ports: [{
      name: 'minecraft',
      port: 25565,
    }],
  },
});

const modsPvc = new PersistentVolumeClaim('mods', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    accessModes: ['ReadWriteOncePod'],
    storageClassName: 'default-cephfs',
    resources: {
      requests: {
        storage: '5Gi',
      },
    },
  },
});

const sts = new StatefulSet('slackpack', {
  metadata: { namespace: ns.metadata.name },
  spec: {
    serviceName: svc.metadata.name,
    selector: {
      matchLabels: {
        'app.kubernetes.io/name': 'slackpack',
      },
    },
    template: {
      metadata: {
        labels: {
          'app.kubernetes.io/name': 'slackpack',
        },
      },
      spec: {
        containers: [{
          name: 'server',
          image: 'itzg/minecraft-server:java24-graalvm',
          ports: [{
            name: 'minecraft',
            containerPort: 25565,
          }],
          env: [
            { name: 'EULA', value: 'true' },
            { name: 'TYPE', value: 'CURSEFORGE' },
            { name: 'CF_SERVER_MOD', value: '/modpacks/Slack Pack.zip' },
          ],
          volumeMounts: [
            { name: 'mods', mountPath: '/modpacks' },
            { name: 'data', mountPath: '/data' },
          ],
        }],
        volumes: [{
          name: 'mods',
          persistentVolumeClaim: {
            claimName: modsPvc.metadata.name,
            readOnly: true,
          },
        }],
      },
    },
    volumeClaimTemplates: [{
      metadata: { name: 'data' },
      spec: {
        accessModes: ['ReadWriteOncePod'],
        storageClassName: 'ssd-rbd',
        resources: {
          requests: {
            storage: '100Gi',
          },
        },
      },
    }],
  },
});
