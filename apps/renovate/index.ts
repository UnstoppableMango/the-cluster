import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config } from '@pulumi/pulumi';
import z from 'zod';

const Versions = z.object({
	chart: z.string(),
	docker: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('renovate', {
	metadata: { name: 'renovate' },
});

const sec = new Secret('renovate', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		// https://github.com/renovatebot/helm-charts/issues/248
		RENOVATE_TOKEN: config.requireSecret('githubToken'),
	},
});

const chart = new Chart('renovate', {
	chart: 'renovate',
	repositoryOpts: {
		repo: 'https://docs.renovatebot.com/helm-charts',
	},
	namespace: ns.metadata.name,
	version: versions.chart,
	// https://github.com/renovatebot/helm-charts/blob/main/charts/renovate/values.yaml
	values: {
		cronjob: {
			schedule: '0 1 * * *', // at 01:00 every day, default
			timeZone: 'America/Chicago',
		},
		image: {
			registry: 'ghcr.io', // default
			repository: 'renovatebot/renovate', // default
			tag: versions.docker,
		},
		renovate: {
			// https://docs.renovatebot.com/self-hosted-configuration
			config: JSON.stringify({
				platform: 'github',
				autodiscover: false, // default
				autodiscoverFilter: [], // default
				repositories: ['UnstoppableMango/the-cluster'],
				presetCachePersistence: true,
			}),
		},
		existingSecret: sec.metadata.name,
		resources: {
			requests: {
				cpu: '1',
				memory: '256Mi',
			},
			limits: {
				cpu: '2',
				memory: '4Gi',
			},
		},
		// https://github.com/bitnami/charts/tree/master/bitnami/redis
		redis: {
			enabled: true,
		},
	},
});
