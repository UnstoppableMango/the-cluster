import { Deployment, StatefulSet } from '@pulumi/kubernetes/apps/v1';
import { ConfigMap, Namespace, PersistentVolumeClaim, Service } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import { Ingress } from '@pulumi/kubernetes/networking/v1';
import { Config } from '@pulumi/pulumi';
import { readFile } from 'node:fs/promises';
import z from 'zod/v4';

const Versions = z.object({
	copyparty: z.object({
		docker: z.string(),
	}),
	plex: z.object({
		docker: z.string(),
		chart: z.string(),
	}),
	tubesync: z.object({
		docker: z.string(),
	}),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new Namespace('media', {
	metadata: { name: 'media' },
});

const movies = new PersistentVolumeClaim('movies', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'ec-cephfs',
		accessModes: ['ReadWriteMany'],
		resources: {
			requests: {
				storage: '20Ti',
			},
		},
	},
}, { protect: true });

const movies4k = new PersistentVolumeClaim('movies4k', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'ec-cephfs',
		accessModes: ['ReadWriteMany'],
		resources: {
			requests: {
				storage: '10Ti',
			},
		},
	},
}, { protect: false });

const tv = new PersistentVolumeClaim('tv', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'ec-cephfs',
		accessModes: ['ReadWriteMany'],
		resources: {
			requests: {
				storage: '20Ti',
			},
		},
	},
}, { protect: true });

const tv4k = new PersistentVolumeClaim('tv4k', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'ec-cephfs',
		accessModes: ['ReadWriteMany'],
		resources: {
			requests: {
				storage: '10Ti',
			},
		},
	},
}, { protect: false });

const anime = new PersistentVolumeClaim('anime', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'default-cephfs',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '10Ti',
			},
		},
	},
}, { protect: true });

const music = new PersistentVolumeClaim('music', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'default-cephfs',
		accessModes: ['ReadWriteOnce'],
		resources: {
			requests: {
				storage: '5Ti',
			},
		},
	},
}, { protect: true });

const youtube = new PersistentVolumeClaim('youtube', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'ec-cephfs',
		accessModes: ['ReadWriteMany'],
		resources: {
			requests: {
				storage: '20Ti',
			},
		},
	},
});

const tubesyncLabels = {
	'app.kubernetes.io/name': 'tubesync',
};

const tubesyncService = new Service('tubesync', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		type: 'ClusterIP',
		ports: [
			{ port: 4848, name: 'http' },
		],
		selector: tubesyncLabels,
	},
});

const tubesync = new StatefulSet('tubesync', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		serviceName: tubesyncService.metadata.name,
		selector: {
			matchLabels: tubesyncLabels,
		},
		template: {
			metadata: {
				labels: tubesyncLabels,
			},
			spec: {
				containers: [{
					name: 'tubesync',
					image: `ghcr.io/meeb/tubesync:${versions.tubesync.docker}`,
					env: [
						{ name: 'TZ', value: 'America/Chicago' },
					],
					volumeMounts: [
						{ name: 'config', mountPath: '/config' },
						{ name: 'youtube', mountPath: '/downloads' },
					],
					resources: {
						requests: {
							cpu: '10m',
							memory: '512Mi',
						},
						limits: {
							cpu: '500m',
							memory: '2Gi',
						},
					},
				}],
				volumes: [
					{
						name: 'youtube',
						persistentVolumeClaim: {
							claimName: youtube.metadata.name,
						},
					},
				],
			},
		},
		volumeClaimTemplates: [{
			metadata: { name: 'config' },
			spec: {
				storageClassName: 'ssd-rbd',
				accessModes: ['ReadWriteOncePod'],
				resources: {
					requests: {
						storage: '10Gi',
					},
				},
			},
		}],
	},
});

const tubesyncIngress = new Ingress('tubesync', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		ingressClassName: 'nginx',
		rules: [{
			host: 'tubesync.thecluster.lan',
			http: {
				paths: [{
					pathType: 'Prefix',
					path: '/',
					backend: {
						service: {
							name: tubesyncService.metadata.name,
							port: { name: 'http' },
						},
					},
				}],
			},
		}],
	},
});

const plexConfig = new PersistentVolumeClaim('plex-config', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		storageClassName: 'ssd-rbd',
		accessModes: ['ReadWriteOncePod'],
		resources: {
			requests: {
				storage: '500Gi',
			},
		},
	},
}, { protect: true });

const plex = new Chart('plex', {
	chart: 'plex-media-server',
	repositoryOpts: {
		repo: 'https://raw.githubusercontent.com/plexinc/pms-docker/gh-pages',
	},
	name: 'plex',
	version: versions.plex.chart,
	namespace: ns.metadata.name,
	values: {
		pms: {
			configExistingClaim: plexConfig.metadata.name,
			resources: {
				limits: {
					cpu: '16',
					memory: '32Gi',
				},
				requests: {
					cpu: '4',
					memory: '4Gi',
				},
			},
		},
		image: {
			registry: 'index.docker.io', // default
			repository: 'plexinc/pms-docker', // default
			tag: versions.plex.docker,
		},
		extraEnv: {
			HOSTNAME: 'plex',
			TZ: 'America/Chicago',
			// What do the numbers mean
			PLEX_UPDATE_CHANNEL: '8',
			ALLOWED_NETWORKS: '192.168.1.1/24',
		},
		service: {
			type: 'LoadBalancer',
		},
		ingress: {
			enabled: true,
			ingressClassName: 'nginx',
			url: 'plex.thecluster.lan',
		},
		extraVolumeMounts: [
			{ name: 'movies', mountPath: '/mnt/movies' },
			{ name: 'movies4k', mountPath: '/mnt/movies4k' },
			{ name: 'tv', mountPath: '/mnt/tv' },
			{ name: 'tv4k', mountPath: '/mnt/tv4k' },
			{ name: 'anime', mountPath: '/mnt/anime' },
			{ name: 'music', mountPath: '/mnt/music' },
		],
		extraVolumes: [
			{
				name: 'movies',
				persistentVolumeClaim: {
					claimName: movies.metadata.name,
				},
			},
			{
				name: 'movies4k',
				persistentVolumeClaim: {
					claimName: movies4k.metadata.name,
				},
			},
			{
				name: 'tv',
				persistentVolumeClaim: {
					claimName: tv.metadata.name,
				},
			},
			{
				name: 'tv4k',
				persistentVolumeClaim: {
					claimName: tv4k.metadata.name,
				},
			},
			{
				name: 'anime',
				persistentVolumeClaim: {
					claimName: anime.metadata.name,
				},
			},
			{
				name: 'music',
				persistentVolumeClaim: {
					claimName: music.metadata.name,
				},
			},
		],
		dnsConfig: {
			options: [{ name: 'ndots', value: '0' }],
		},
	},
});

const copypartyLabels = {
	'app.kubernetes.io/name': 'copyparty',
};

const copypartyConfig = new ConfigMap('copyparty', {
	metadata: { namespace: ns.metadata.name },
	data: {
		'copyparty.conf': readFile('copyparty.conf', 'utf-8'),
	},
});

const copyparty = new Deployment('copyparty', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		selector: {
			matchLabels: copypartyLabels,
		},
		template: {
			metadata: {
				labels: copypartyLabels,
			},
			spec: {
				containers: [{
					// https://github.com/9001/copyparty/tree/hovudstraum/scripts/docker
					name: 'copyparty',
					image: `ghcr.io/9001/copyparty-ac:${versions.copyparty.docker}`,
					ports: [
						{ name: 'http', containerPort: 3923 },
						// { name: 'ftp', containerPort: 3921 },
					],
					volumeMounts: [
						{ name: 'config', mountPath: '/cfg/copyparty.conf', subPath: 'copyparty.conf' },
						{ name: 'movies', mountPath: '/w/movies' },
						{ name: 'movies4k', mountPath: '/w/movies4k' },
						{ name: 'tv', mountPath: '/w/tv' },
						{ name: 'tv4k', mountPath: '/w/tv4k' },
						{ name: 'anime', mountPath: '/w/anime' },
						{ name: 'music', mountPath: '/w/music' },
						{ name: 'youtube', mountPath: '/w/youtube' },
					],
					resources: {
						requests: {
							cpu: '300m',
							memory: '128Mi',
						},
						limits: {
							cpu: '1',
							memory: '512Mi',
						},
					},
				}],
				volumes: [
					{
						name: 'config',
						configMap: {
							name: copypartyConfig.metadata.name,
						},
					},
					{
						name: 'movies',
						persistentVolumeClaim: {
							claimName: movies.metadata.name,
						},
					},
					{
						name: 'movies4k',
						persistentVolumeClaim: {
							claimName: movies4k.metadata.name,
						},
					},
					{
						name: 'tv',
						persistentVolumeClaim: {
							claimName: tv.metadata.name,
						},
					},
					{
						name: 'tv4k',
						persistentVolumeClaim: {
							claimName: tv4k.metadata.name,
						},
					},
					{
						name: 'anime',
						persistentVolumeClaim: {
							claimName: anime.metadata.name,
						},
					},
					{
						name: 'music',
						persistentVolumeClaim: {
							claimName: music.metadata.name,
						},
					},
					{
						name: 'youtube',
						persistentVolumeClaim: {
							claimName: youtube.metadata.name,
						},
					},
				],
			},
		},
	},
});

const copypartyService = new Service('copyparty', {
	metadata: { namespace: ns.metadata.name },
	spec: {
		type: 'ClusterIP',
		ports: [
			{ port: 3923, name: 'http', targetPort: 'http' },
		],
		selector: copypartyLabels,
	},
});

const copypartyIngress = new Ingress('copyparty', {
	metadata: {
		namespace: ns.metadata.name,
		annotations: {
			'cert-manager.io/issuer-group': 'cert-manager.io',
			'cert-manager.io/issuer-kind': 'ClusterIssuer',
			'cert-manager.io/issuer': 'thecluster.lan',
		},
	},
	spec: {
		ingressClassName: 'nginx',
		rules: [{
			host: 'copyparty.thecluster.lan',
			http: {
				paths: [{
					pathType: 'Prefix',
					path: '/',
					backend: {
						service: {
							name: copypartyService.metadata.name,
							port: { name: 'http' },
						},
					},
				}],
			},
		}],
		tls: [{
			secretName: 'copyparty-tls',
			hosts: ['copyparty.thecluster.lan'],
		}],
	},
});
