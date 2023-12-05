import { Output, StackReference } from '@pulumi/pulumi';
import { CertManagerOutputs } from '../types';
import { cluster } from '../config';

const ref = new StackReference('cert-manager', {
  name: `UnstoppableMango/thecluster-cert-manager/${cluster}`,
});

/**
 * @deprecated Use `clusterIssuers.prod` instead
 */
export const issuer = ref.requireOutput('prod');

export const clusterIssuers = ref.requireOutput('clusterIssuers') as Output<CertManagerOutputs['clusterIssuers']>;

export const outputs: CertManagerOutputs = {
  prod: ref.requireOutput('prod') as Output<string>,
  stage: ref.requireOutput('staging') as Output<string>,
  clusterIssuers,
}
