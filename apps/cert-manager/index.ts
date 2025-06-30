import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('cert-manager', {
	metadata: { name: 'cert-manager' },
});

const chart = new k8s.helm.v4.Chart('cert-manager', {
	name: 'cert-manager',
	chart: 'cert-manager',
	version: 'v1.17.1',
	repositoryOpts: {
		repo: 'https://charts.jetstack.io',
	},
	namespace: ns.metadata.name,
	values: {
		crds: {
			enabled: true,
			keep: true,
		},
		podDisruptionBudget: {
			enabled: true,
			minAvailable: 1,
		},
		enableCertificateOwnerRef: true,
	},
});
