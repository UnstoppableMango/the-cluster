import { StackReference } from '@pulumi/pulumi';

export function ref(project: string, cluster: string): StackReference {
  return new StackReference(project, {
    name: `UnstoppableMango/thecluster-${project}/${cluster}`,
  });
}
