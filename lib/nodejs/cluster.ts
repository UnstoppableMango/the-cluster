import { StackReference } from '@pulumi/pulumi';

export function ref(cluster: string, stack?: string): StackReference {
  return new StackReference(cluster, {
    name: `UnstoppableMango/thecluster-${cluster}/${stack ?? 'prod'}`,
  });
}
