import * as k8s from '@pulumi/kubernetes';
import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v4';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { clusterIssuers, databases, ingresses, shared } from '@unstoppablemango/thecluster/cluster/from-stack';
import { required } from '@unstoppablemango/thecluster/util';
import * as path from 'node:path';
import { auth, hosts, production, versions } from './config';

const ns = Namespace.get('keycloak', shared.namespaces.keycloak);

const { adminUser } = auth;
const dbHostKey = 'dbHost';
const dbPortKey = 'dbPort';
const dbUserKey = 'dbUser';
const dbPasswordKey = 'dbPassword';
const postgresCertDir = '/opt/unmango/postgres/certs';
const certificatePassword = 'changeit';
const certificatePasswordKey = 'certPassword';

const adminPassword = new random.RandomPassword('admin', {
	length: 48,
	special: false,
});

const cert = new Certificate('keycloak', {
	metadata: {
		name: 'keycloak',
		namespace: ns.metadata.name,
	},
	spec: {
		secretName: 'keycloak-tls',
		issuerRef: clusterIssuers.ref(x => x.keycloak),
		duration: '2160h0m0s', // 90d
		renewBefore: '360h0m0s', // 15d
		commonName: 'kc.thecluster.io',
		subject: {
			organizations: ['unmango'],
		},
		// TODO: Verify these will work
		privateKey: {
			algorithm: 'ECDSA',
			size: 256,
			rotationPolicy: 'Always',
		},
		usages: [
			'server auth',
			'client auth',
		],
		dnsNames: [
			hosts.external,
			...hosts.aliases.external,
			hosts.internal,
			...hosts.aliases.internal,
		],
	},
});

const config = new ConfigMap('keycloak', {
	metadata: {
		name: 'keycloak',
		namespace: ns.metadata.name,
	},
	data: {
		// https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNECT-SSLCERT
		// https://jdbc.postgresql.org/documentation/use/#connection-parameters/
		// https://github.com/bitnami/containers/blob/9f6278e4abadcf4ff63eb42310739646e1ed1485/bitnami/keycloak/22/debian-11/rootfs/opt/bitnami/scripts/libkeycloak.sh#L146
		// This wasn't useful but anyways: https://www.keycloak.org/server/db
		// We're so damn close on this shit
		// Curve not supported: secp224r1 [NIST P-224] (1.3.132.0.33)
		KEYCLOAK_JDBC_PARAMS: [
			'ssl=true',
			'sslmode=verify-full',
			'sslcertmode=require',
			`sslrootcert=${path.join(postgresCertDir, 'ca.crt')}`,
			`sslcert=${path.join(postgresCertDir, 'tls.crt')}`, // Ignored when in p12 format?
			`sslkey=${path.join(postgresCertDir, 'tls.key')}`,
			// Why we don't care about this being plaintext
			// https://cert-manager.io/docs/faq/#simple-answer
			// `sslpassword=${certificatePassword}`,
		].join('&'),
	},
});

const secret = new Secret('keycloak', {
	metadata: {
		name: 'keycloak',
		namespace: ns.metadata.name,
	},
	stringData: {
		adminPassword: adminPassword.result,
		[dbHostKey]: pulumi.interpolate`${databases.keycloak.hostname}`,
		[dbPortKey]: pulumi.interpolate`${databases.keycloak.port}`,
		[dbUserKey]: databases.keycloak.owner,
		// [dbPasswordKey]: pulumi.output('NA because we use cert auth'),
		[dbPasswordKey]: databases.keycloak.password.apply(required),
		database: databases.keycloak.name,
		[certificatePasswordKey]: certificatePassword,
	},
});

const postgresCert = new Certificate('postgres', {
	metadata: {
		name: 'postgres',
		namespace: ns.metadata.name,
	},
	spec: {
		secretName: 'postgres-cert',
		issuerRef: clusterIssuers.ref(x => x.postgres),
		duration: '2160h0m0s', // 90d
		renewBefore: '360h0m0s', // 15d
		commonName: 'keycloak',
		usages: ['client auth'],
		privateKey: {
			algorithm: 'RSA',
			encoding: 'PKCS8',
			size: 2048,
			rotationPolicy: 'Always',
		},
		keystores: {
			pkcs12: {
				create: true,
				passwordSecretRef: {
					name: secret.metadata.name,
					key: certificatePasswordKey,
				},
			},
		},
	},
});

const chart = new Chart('keycloak', {
	chart: 'oci://registry-1.docker.io/bitnamicharts/keycloak',
	version: '22.2.4',
	namespace: ns.metadata.name,
	values: {
		// https://github.com/bitnami/charts/tree/main/bitnami/keycloak/#parameters
		image: {
			registry: 'docker.io',
			repository: 'bitnami/keycloak',
			tag: versions.keycloak,
		},
		auth: {
			adminUser,
			existingSecret: secret.metadata.name,
			passwordSecretKey: 'adminPassword',
		},
		// tls: {
		//   enabled: true,
		//   existingSecret: cert.spec.apply(x => x?.secretName),
		//   usePem: true,
		// },
		production,
		// proxy: 'reencrypt',
		proxy: 'edge',
		// extraEnvVarsCM: config.metadata.name,
		containerPorts: {
			http: 8080,
			https: 8443,
			infinispan: 7800,
		},
		podSecurityContext: { enabled: true },
		containerSecurityContext: { enabled: true },
		priorityClassName: 'system-cluster-critical',
		resources: {
			limits: {
				// Initial startup needs a bit of heft
				cpu: '4',
				memory: '4Gi',
			},
			requests: {
				cpu: '20m',
				memory: '512Mi',
			},
		},
		extraVolumes: [{
			name: 'postgres-cert',
			defaultMode: 0o600,
			secret: {
				secretName: postgresCert.spec.apply(x => x?.secretName),
			},
		}],
		extraVolumeMounts: [{
			name: 'postgres-cert',
			mountPath: postgresCertDir,
			readonly: true,
		}],
		service: {
			type: 'ClusterIP',
			http: {
				enabled: true,
			},
			ports: {
				http: 80,
				https: 443,
			},
		},
		ingress: {
			enabled: true,
			ingressClassName: ingresses.theclusterIo,
			pathType: 'Prefix',
			hostname: hosts.external,
			extraHosts: hosts.aliases.external.map(h => ({
				name: h,
				path: '/',
				pathType: 'Prefix',
			})),
			annotations: {
				'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',
				// Still adding support for this annotation in the controller
				'cloudflare-tunnel-ingress-controller.strrl.dev/origin-capool': '/todo/keycloak/ca-certificates.crt',
				'pulumi.com/skipAwait': 'true',
			},
		},
		pdb: { create: true },
		autoscaling: {
			enabled: true,
			maxReplicas: 3,
		},
		metrics: { enabled: true },
		postgresql: { enabled: false },
		externalDatabase: {
			existingSecret: secret.metadata.name,
			existingSecretHostKey: 'dbHost',
			existingSecretPortKey: 'dbPort',
			existingSecretUserKey: 'dbUser',
			existingSecretDatabaseKey: 'database',
			existingSecretPasswordKey: 'dbPassword',
		},
	},
});

// const service = chart.getResource(
//   'v1/Service',
//   'keycloak/keycloak',
// );

// export const clusterIp = service.spec.clusterIP;
export const clusterIp = 'TODO';

const internalHosts = [hosts.internal, ...hosts.aliases.internal];
const internalIngress = new k8s.networking.v1.Ingress('internal', {
	metadata: {
		name: 'internal',
		namespace: ns.metadata.name,
		annotations: {
			'cert-manager.io/cluster-issuer': clusterIssuers.prod,
			'external-dns.alpha.kubernetes.io/hostname': [
				hosts.internal,
				...hosts.aliases.internal,
			].join(','),
		},
	},
	spec: {
		ingressClassName: ingresses.internal,
		rules: internalHosts.map(host => ({
			host,
			http: {
				paths: [{
					path: '/',
					pathType: 'ImplementationSpecific',
					backend: {
						service: {
							// name: service.metadata.name,
							name: 'TODO',
							port: {
								// name: service.spec.ports[0].name,
								name: 'TODO',
							},
						},
					},
				}],
			},
		})),
		tls: [{
			secretName: 'keycloak-internal-tls',
			hosts: internalHosts,
		}],
	},
});

export { hosts };
export const hostname = hosts.external;
export const allHosts = {
	external: [hosts.external, ...hosts.aliases.external],
	internal: [hosts.internal, ...hosts.aliases.internal],
};

export const username = auth.adminUser;
export const password = adminPassword.result;
