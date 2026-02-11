import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Config, interpolate } from '@pulumi/pulumi';
import z from 'zod';

const GitHub = z.object({
	appId: z.string(),
	installationId: z.string(),
	privateKey: z.string(),
});

const Versions = z.object({
	bun: z.string(),
	chart: z.string(),
	docker: z.string(),
});

type GitHub = z.infer<typeof GitHub>;
type Versions = z.infer<typeof Versions>;

const config = new Config();
const github = GitHub.parse(config.requireObject('github'));
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('renovate', {
	metadata: { name: 'renovate' },
});

const sec = new Secret('renovate', {
	metadata: { namespace: ns.metadata.name },
	stringData: {
		'key.pem': github.privateKey,
	},
});

const tokenPath = '/shared/token';

const configjs = `
const fs = require('fs');

const token = fs.readFileSync('${tokenPath}', 'utf8').trim();

module.exports = {
	token,
	platform: 'github',
	autodiscover: false, // default
	autodiscoverFilter: [], // default
	repositories: [
		'UnstoppableMango/a2b',
		'UnstoppableMango/audio',
		'UnstoppableMango/CliWrap.FSharp',
		'UnstoppableMango/dotfiles',
		'UnstoppableMango/github',
		'UnstoppableMango/ihfs',
		'UnstoppableMango/lang',
		'UnstoppableMango/openapi2go',
		'UnstoppableMango/openapi2terraform',
		'UnstoppableMango/ouranosis',
		'UnstoppableMango/minecraft-manager',
		'UnstoppableMango/nixos',
		// 'UnstoppableMango/pcl2openapi',
		// 'UnstoppableMango/pfsense-operator',
		// 'UnstoppableMango/plex-operator',
		'UnstoppableMango/pia-manual-connections',
		'UnstoppableMango/pulumi2crd',
		'UnstoppableMango/pulumi-bun',
		'UnstoppableMango/renovate-config',
		'UnstoppableMango/resume',
		// 'UnstoppableMango/tdl',
		// 'UnstoppableMango/terraform-provider-pfsense',
		// 'UnstoppableMango/terraform2crd',
		'UnstoppableMango/thecluster.io',
		'UnstoppableMango/the-cluster',
		// 'UnstoppableMango/UnMango.Extensions.CommandLine',
		'UnstoppableMango/unstoppablemango.io',
		'UnstoppableMango/ux',
		'UnstoppableMango/wireguard-cni',
		'UnstoppableMango/xmage-docker',
		'UnstoppableMango/x12',
	],
	presetCachePersistence: true,
};
`;

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
			schedule: '*/20 * * * *', // Every 20m, we'll get it eventually...
			timeZone: 'America/Chicago',
			initContainers: [{
				name: 'github-app-auth',
				image: interpolate`oven/bun:${versions.bun}`,
				command: [
					'/bin/sh',
					'-c',
					[
						'bunx github-app-installation-token',
						`--appId ${github.appId}`,
						`--installationId ${github.installationId}`,
						`--privateKeyLocation /auth/key.pem`,
						`> ${tokenPath}`,
					].join(' '),
				],
				volumeMounts: [
					{
						name: 'private-key',
						mountPath: '/auth',
					},
					{
						name: 'shared',
						mountPath: '/shared',
					},
				],
			}],
		},
		env: {
			LOG_LEVEL: 'debug',
		},
		extraVolumeMounts: [{
			name: 'shared',
			mountPath: '/shared',
		}],
		extraVolumes: [
			{
				name: 'private-key',
				secret: {
					secretName: sec.metadata.name,
				},
			},
			{
				name: 'shared',
				emptyDir: {},
			},
		],
		image: {
			registry: 'ghcr.io', // default
			repository: 'renovatebot/renovate', // default
			tag: versions.docker,
		},
		renovate: {
			// https://docs.renovatebot.com/self-hosted-configuration
			config: configjs,
			configIsJavaScript: true,
		},
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
