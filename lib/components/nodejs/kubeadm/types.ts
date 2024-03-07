import { Input, Inputs } from '@pulumi/pulumi';

export interface KubeadmArgs {
  ip?: Input<string>;
}
