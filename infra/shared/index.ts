import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const mediaNs = new k8s.core.v1.Namespace('media', {
  metadata: { name: 'media' },
}, { provider });

const postgresNs = new k8s.core.v1.Namespace('postgres', {
  metadata: { name: 'postgres' },
}, { provider });

export const mediaNamespace = mediaNs.metadata.name;
export const postgresNamespace = postgresNs.metadata.name;
