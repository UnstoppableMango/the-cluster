import { Namespace } from '@pulumi/kubernetes/core/v1';
import { TunnelBinding } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { fqdn, provider } from './config';

const ns = new Namespace('palworld', {
  metadata: { name: 'palworld' },
}, { provider });

const tunnel = new TunnelBinding('api-server', {
  metadata: {
    name: 'api-server',
    namespace: ns.metadata.name,
  },
  tunnelRef: {
    kind: 'ClusterTunnel',
    name: 'thecluster.io',
  },
  subjects: [{
    name: 'palworld',
    spec: {
      fqdn,
      target: 'tcp://192.168.1.11:8211',
      protocol: 'tcp',
    },
  }],
}, { provider });
