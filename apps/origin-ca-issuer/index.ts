import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { ConfigGroup } from '@pulumi/kubernetes/yaml/v2';
import * as pulumi from '@pulumi/pulumi';
import z from 'zod/v4';

const Versions = z.object({
	app: z.string(),
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new pulumi.Config();
const versions = Versions.parse(config.requireObject('versions'));

const crds = new ConfigGroup('crds', {
	files: [
		`https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${versions.app}/deploy/crds/cert-manager.k8s.cloudflare.com_originissuers.yaml`,
		`https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/v${versions.app}/deploy/crds/cert-manager.k8s.cloudflare.com_clusteroriginissuers.yaml`,
	],
});

const ns = new Namespace('origin-ca-issuer', {
	metadata: { name: 'origin-ca-issuer' },
});

const chart = new Chart('origin-ca-issuer', {
	chart: 'oci://ghcr.io/cloudflare/origin-ca-issuer-charts/origin-ca-issuer',
	version: versions.chart,
	namespace: ns.metadata.name,
	// https://github.com/cloudflare/origin-ca-issuer/blob/trunk/deploy/charts/origin-ca-issuer/values.yaml
	values: {
		controller: {
			image: {
				repository: 'cloudflare/origin-ca-issuer', // default
				tag: versions.app,
			},
		},
	},
}, { dependsOn: crds });

const apiTokenKey = 'api-token';
const secret = new Secret('cloudflare', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		[apiTokenKey]: config.requireSecret('apiToken'),
	},
});

const clusterIssuer = new CustomResource('cloudflare', {
	apiVersion: 'cert-manager.k8s.cloudflare.com/v1',
	kind: 'ClusterOriginIssuer',
	metadata: {},
	spec: {
		requestType: 'OriginECC',
		auth: {
			tokenRef: {
				name: secret.metadata.name,
				key: apiTokenKey,
			},
		},
	},
}, { dependsOn: chart });

export const clusterIssuerName = clusterIssuer.metadata.name;
