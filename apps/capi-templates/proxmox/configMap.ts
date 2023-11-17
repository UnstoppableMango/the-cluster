import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as YAML from 'yaml';
import ns from '../namespace';
import { Proxmox, Versions } from '../types';

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');
const proxmox = config.requireObject<Proxmox>('proxmox');

const serviceAccount = YAML.stringify({
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    name: 'proxmox-cloud-controller-manager',
    namespace: 'kube-system',
  },
});

const clusterRoleBinding = YAML.stringify({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'ClusterRoleBinding',
  metadata: {
    name: 'system:proxmox-cloud-controller-manager',
  },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
  subjects: [{
    kind: 'ServiceAccount',
    name: 'proxmox-cloud-controller-manager',
    namespace: 'kube-system',
  }],
});

const daemonSet = YAML.stringify({
  apiVersion: 'apps/v1',
  kind: 'DaemonSet',
  metadata: {
    name: 'cloud-controller-manager',
    namespace: 'kube-system',
    labels: {
      'k8s-app': 'cloud-controller-manager',
    },
  },
  spec: {
    selector: {
      matchLabels: {
        'k8s-app': 'cloud-controller-manager',
      },
    },
    template: {
      metadata: {
        labels: {
          'k8s-app': 'cloud-controller-manager',
        },
      },
      spec: {
        serviceAccountName: 'proxmox-cloud-controller-manager',
        containers: [{
          name: 'cloud-controller-manager',
          image: `ghcr.io/sp-yduck/cloud-provider-proxmox:${versions['cloud-provider-proxmox']}`,
          command: [
            '/usr/local/bin/cloud-controller-manager',
            '--cloud-provider=proxmox',
            '--cloud-config=/etc/proxmox/config.yaml',
            '--leader-elect=true',
            '--use-service-account-credentials',
            '--controllers=cloud-node,cloud-node-lifecycle',
          ],
          volumeMounts: [{
            name: 'cloud-config',
            mountPath: '/etc/proxmox',
            readOnly: true,
          }],
          livenessProbe: {
            httpGet: {
              path: '/healthz',
              port: 10258,
              scheme: 'HTTPS',
            },
            initialDelaySeconds: 20,
            periodSeconds: 30,
            timeoutSeconds: 5,
          },
        }],
        volumes: [{
          name: 'cloud-config',
          secret: {
            secretName: 'cloud-config',
          },
        }],
        tolerations: [
          {
            key: 'node.cloudprovider.kubernetes.io/uninitialized',
            value: 'true',
            effect: 'NoSchedule',
          },
          {
            key: 'node-role.kubernetes.io/control-plane',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
          {
            key: 'node-role.kubernetes.io/master',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
        ],
        nodeSelector: {
          'node-role.kubernetes.io/control-plane': '',
        },
      },
    },
  },
});

const secret = YAML.stringify({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    name: 'cloud-config',
    namespace: 'kube-system',
  },
  stringData: {
    'config.yaml': YAML.stringify({
      proxmox: {
        url: proxmox.endpoint,
        user: proxmox.username,
        password: proxmox.password,
        tokenID: '',
        secret: '',
      },
    }),
  },
});

export default new k8s.core.v1.ConfigMap('cloud-controller-manager', {
  metadata: {
    name: 'cloud-controller-manager',
    namespace: ns.metadata.name,
  },
  data: {
    'cloud-controller-manager.yaml': [
      serviceAccount,
      clusterRoleBinding,
      daemonSet,
      secret,
    ].join('---\n'),
  },
});
