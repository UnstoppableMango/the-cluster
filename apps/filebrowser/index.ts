import * as fs from 'node:fs/promises';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { clusterIssuers, ingresses, provider, shared, storageClasses } from '@unmango/thecluster/cluster/from-stack';
import { jsonStringify } from '@unmango/thecluster';
import { hosts, versions } from './config';

const ns = k8s.core.v1.Namespace.get('media', 'media', { provider });

const servicePort = 8080;
const containerPort = 8080;

const config = new k8s.core.v1.ConfigMap('config', {
  metadata: {
    name: 'config',
    namespace: ns.metadata.name,
  },
  data: {
    'settings.json': jsonStringify({
      port: containerPort,
      baseUrl: '',
      address: '',
      log: 'stdout',
      database: '/database/filebrowser.db',
      root: '/srv',
    }),
    'setup.sh': fs.readFile('setup.sh', { encoding: 'utf-8' }),
  },
}, { provider });

const service = new k8s.core.v1.Service('filebrowser', {
  metadata: {
    name: 'filebrowser',
    namespace: ns.metadata.name,
  },
  spec: {
    type: 'ClusterIP',
    selector: {
      app: 'filebrowser',
    },
    ports: [{
      name: 'http',
      port: servicePort,
    }],
  },
}, { provider });

const app = new k8s.apps.v1.StatefulSet('filebrowser', {
  metadata: {
    name: 'filebrowser',
    namespace: ns.metadata.name,
  },
  spec: {
    selector: {
      matchLabels: {
        app: 'filebrowser',
      },
    },
    // Chicken and egg with the service
    serviceName: 'filebrowser',
    template: {
      metadata: {
        labels: {
          app: 'filebrowser',
        },
      },
      spec: {
        // securityContext: {
        //   // runAsNonRoot: true,
        //   runAsUser: 1001,
        //   runAsGroup: 1001,
        // },
        initContainers: [{
          name: 'setup',
          image: `filebrowser/filebrowser:${versions.filebrowser}`,
          command: ['bash', '/setup.sh'],
          env: [
            // { name: 'PUID', value: '1001' },
            // { name: 'PGID', value: '1001' },
            { name: 'DB_PATH', value: '/db/filebrowser.db' },
          ],
          volumeMounts: [{
            name: 'database',
            mountPath: '/db',
          }, {
            name: 'config',
            mountPath: '/setup.sh',
            subPath: 'setup.sh',
          }],
        }],
        containers: [{
          name: 'filebrowser',
          image: `filebrowser/filebrowser:${versions.filebrowser}`,
          ports: [{ containerPort, name: 'http' }],
          // securityContext: {
          //   allowPrivilegeEscalation: true,
          //   privileged: false,
          //   // runAsNonRoot: true,
          //   runAsUser: 1001,
          //   runAsGroup: 1001,
          //   capabilities: { drop: ['ALL'] },
          // },
          // env: [
          //   { name: 'PUID', value: '1001' },
          //   { name: 'PGID', value: '1001' },
          // ],
          volumeMounts: [{
            name: 'database',
            mountPath: '/database',
          }, {
            name: 'config',
            mountPath: '/config/settings.json',
            subPath: 'settings.json',
          }, {
            name: 'music',
            mountPath: '/srv/music',
          }, {
            name: 'movies',
            mountPath: '/srv/movies',
          }, {
            name: 'tv',
            mountPath: '/srv/tv',
          }, {
            name: 'anime',
            mountPath: '/srv/anime',
          }],
          readinessProbe: {
            httpGet: {
              port: containerPort,
            },
            
          },
          livenessProbe: {
            httpGet: {
              port: containerPort,
            },
          },
          resources: {
            requests: {
              cpu: '10m',
              memory: '64Mi',
            },
            limits: {
              cpu: '10m',
              memory: '64Mi',
            },
          },
        }],
        volumes: [
          {
            name: 'config',
            configMap: {
              name: config.metadata.name,
            },
          },
          ...['music', 'movies', 'tv', 'anime'].map(name => ({
            name,
            persistenVolumeClaim: {
              claimName: name,
            },
          })),
        ],
      },
    },
    volumeClaimTemplates: [{
      metadata: { name: 'database' },
      spec: {
        storageClassName: storageClasses.rbd,
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: '1Gi',
          },
        },
      },
    }],
  },
}, { provider });

const ingress = new k8s.networking.v1.Ingress('filebrowser', {
  metadata: {
    name: 'filebrowser',
    namespace: ns.metadata.name,
    annotations: {
      'cert-manager.io/cluster-issuer': clusterIssuers.stage,
    },
  },
  spec: {
    ingressClassName: ingresses.internal,
    rules: [{
      host: hosts.internal,
      http: {
        paths: [{
          path: '/',
          pathType: 'ImplementationSpecific',
          backend: {
            service: {
              name: service.metadata.name,
              port: { name: 'http' },
            },
          },
        }],
      },
    }],
    tls: [{
      hosts: [hosts.internal],
      secretName: 'filebrowser-internal-tls',
    }],
  },
}, { provider });
