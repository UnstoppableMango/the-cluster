import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions } from './config.ts';

const ns = new Namespace('ironic', {
  metadata: { name: 'ironic' },
}, { provider });
