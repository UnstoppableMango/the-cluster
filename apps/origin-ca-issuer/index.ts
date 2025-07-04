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

const manifests = new ConfigGroup('origin-ca-issuer', {
	files: [
		`https://raw.githubusercontent.com/cloudflare/origin-ca-issuer/${versions.app}/deploy/crds/cert-manager.k8s.cloudflare.com_originissuers.yaml`,
	],
});

const chart = new Chart('origin-ca-issuer', {
	chart: 'oci://ghcr.io/cloudflare/origin-ca-issuer-charts/origin-ca-issuer',
	version: versions.chart,
	values: {
		controller: {
			image: {
				tag: versions.app,
			},
		},
	},
}, { dependsOn: manifests });
