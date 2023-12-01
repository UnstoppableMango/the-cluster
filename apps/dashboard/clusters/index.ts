import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { cluster } from '../config';

const ref = new pulumi.StackReference(cluster, {
  name: `UnstoppableMango/thecluster-${cluster}/prod`,
});

export const kubeconfig = ref.requireOutput('kubeconfig');
export const provider = new k8s.Provider(cluster, { kubeconfig });
