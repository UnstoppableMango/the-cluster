import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('kube-vip', {
  metadata: { name: 'kube-vip' },
}, { provider });

const chart = new k8s.helm.v3.Chart('kube-vip', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    'kube-vip': {
      image: {
        tag: versions['kube-vip'],
      },
      env: {
        vip_interface: 'bond0', // Probably?
        vip_arp: 'true',
        lb_enable: 'true',
        lb_port: '42069',
        cp_enable: 'false',
        svc_enable: 'true',
        svc_election: 'true',
        vip_leaderelection: 'true',
      },
      resources: {
        limits: {
          cpu: '100m',
          memory: '128Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    },
  },
}, { provider });
