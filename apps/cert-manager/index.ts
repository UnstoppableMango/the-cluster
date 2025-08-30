import * as k8s from '@pulumi/kubernetes';
import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Secret } from '@pulumi/kubernetes/core/v1';
import * as pulumi from '@pulumi/pulumi';
import z from 'zod/v4';

const CA = z.object({
	certPem: z.string(),
	privateKeyPem: z.string(),
});

const Versions = z.object({
	certManager: z.string(),
});

type CA = z.infer<typeof CA>;
type Versions = z.infer<typeof Versions>;

const pki = new pulumi.StackReference('pki', {
	name: 'UnstoppableMango/pki/prod',
});

const config = new pulumi.Config();
const ca = pki.requireOutput('thecluster').apply(CA.parse);
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

const caSecret = new Secret('ca', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		'tls.crt': ca.certPem,
		'tls.key': ca.privateKeyPem,
	},
});

const theclusterIssuer = new CustomResource('thecluster.io', {
	apiVersion: 'cert-manager.io/v1',
	kind: 'ClusterIssuer',
	metadata: { name: 'thecluster.io' },
	spec: {
		ca: { secretName: caSecret.metadata.name },
	},
});

export const theclusterIssuerName = theclusterIssuer.metadata.name;
