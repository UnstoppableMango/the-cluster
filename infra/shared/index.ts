import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const mediaNs = new k8s.core.v1.Namespace('media', {
  metadata: { name: 'media' },
}, { provider });

export const mediaNamespace = mediaNs.metadata.name;