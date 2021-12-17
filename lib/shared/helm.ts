import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

export type ReleaseDefaults = Pick<Required<k8s.helm.v3.ReleaseArgs>,
  | 'atomic'
  | 'createNamespace'
  | 'cleanupOnFail'
  | 'resetValues'
  | 'skipCrds'
>;

type ReleaseWithDefaults = Exclude<k8s.helm.v3.ReleaseArgs, ReleaseDefaults>;

export const releaseDefaults: ReleaseDefaults = {
  atomic: true,
  cleanupOnFail: true,
  createNamespace: false,
  resetValues: false,
  skipCrds: true,
}

export const releaseWithDefaults = (
  name: string,
  args: ReleaseWithDefaults,
  opts?: pulumi.ComponentResourceOptions): k8s.helm.v3.Release =>
    new k8s.helm.v3.Release(name, { ...args, ...releaseDefaults }, opts);
