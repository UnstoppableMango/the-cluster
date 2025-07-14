import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config } from '@pulumi/pulumi';
import z from 'zod/v4';

const Cloudflare = z.object({
	apiToken: z.string(),
});

const Versions = z.object({
	chart: z.string(),
	cloudflareOperator: z.string(),
});

type Cloudflare = z.infer<typeof Cloudflare>;
type Versions = z.infer<typeof Versions>;

const config = new Config();
const cloudflare = Cloudflare.parse(config.requireObject('cloudflare'));
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('cloudflare-system', {
	metadata: { name: 'cloudflare-system' },
});

const apiTokenKey = 'api-token';

const secret = new Secret('api-secrets', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		[apiTokenKey]: cloudflare.apiToken,
	},
});

const chart = new Chart('cloudflare-operator', {
	chart: 'cloudflare-operator',
	version: versions.chart,
	repositoryOpts: {
		repo: 'https://unmango.github.io/cloudflare-operator',
	},
	namespace: ns.metadata.name,
	values: {
		auth: {
			enabled: true,
			apiTokenRef: {
				name: secret.metadata.name,
				key: apiTokenKey,
			},
		},
		controllerManager: {
			replicas: 2,
			container: {
				image: {
					repository: 'ghcr.io/unmango/cloudflare-operator',
					tag: versions.cloudflareOperator,
				},
			},
		},
	},
});

export const namespace = ns.metadata.name;
export const apiSecretsName = secret.metadata.name;
