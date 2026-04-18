import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import z from 'zod/v4';

const Versions = z.object({
	certManager: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new pulumi.Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new k8s.core.v1.Namespace('cert-manager', {
	metadata: { name: 'cert-manager' },
});

const chart = new k8s.helm.v4.Chart('cert-manager', {
	name: 'cert-manager',
	chart: 'cert-manager',
	version: versions.certManager,
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
