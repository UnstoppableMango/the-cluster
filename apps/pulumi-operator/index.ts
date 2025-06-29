import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { getStack } from '@pulumi/pulumi';
import { AccessToken } from '@pulumi/pulumiservice';
import { versions } from './config';

const ns = new Namespace('pulumi-operator', {
	metadata: { name: 'pulumi-kubernetes-operator' },
});

const chart = new Chart('pulumi-operator', {
	chart: 'oci://ghcr.io/pulumi/helm-charts/pulumi-kubernetes-operator',
	version: versions.pulumiOperator,
	namespace: ns.metadata.name,
});

export { versions };
