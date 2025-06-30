import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';

const ns = new Namespace('crossplane-system', {
	metadata: { name: 'crossplane-system' },
});

const chart = new Chart('crossplane', {
	chart: 'crossplane',
	repositoryOpts: {
		repo: 'https://charts.crossplane.io/stable',
	},
	namespace: ns.metadata.name,
	values: {
		replicas: 2,
	},
});
