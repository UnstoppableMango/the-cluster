import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';

export const ns = Namespace.get('cert-manager', 'cert-manager', { provider });
export const clusterNs = ns;
export const trustNs = Namespace.get('trust-manager', 'trust-manager', { provider });
