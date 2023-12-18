import { StackReference } from '@pulumi/pulumi';

export function ref(project: string, cluster: string): StackReference {
  return new StackReference(`${project}-${cluster}`, {
    name: `UnstoppableMango/thecluster-${project}/${cluster}`,
  });
}
