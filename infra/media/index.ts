import { Namespace, PersistentVolumeClaim } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';

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
			tag: '1.42.1.10060-4e8b05daf',
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
