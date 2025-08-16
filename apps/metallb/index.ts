import * as k8s from '@pulumi/kubernetes';
import { Config } from '@pulumi/pulumi';
import z from 'zod';
import { loadBalancerClass, stack } from './config';
import z from 'zod';
import { Config } from '@pulumi/pulumi';

const Versions = z.object({
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const Versions = z.object({
	chart: z.string(),
});

type Versions = z.infer<typeof Versions>;

const config = new Config();
const versions = Versions.parse(config.requireObject('versions'));

const ns = new k8s.core.v1.Namespace('metallb-system', {
	metadata: {
		name: 'metallb-system',
		labels: {
			// https://github.com/metallb/metallb/issues/1457
			// https://github.com/metallb/metallb/pull/1467
			'pod-security.kubernetes.io/audit': 'privileged',
			'pod-security.kubernetes.io/enforce': 'privileged',
			'pod-security.kubernetes.io/warn': 'privileged',
		},
	},
});

const chart = new k8s.helm.v4.Chart('metallb', {
	chart: 'metallb',
	version: versions.chart,
	repositoryOpts: {
		repo: 'https://metallb.github.io/metallb',
	},
	namespace: ns.metadata.name,
	values: {
		crds: { enabled: true },
		// Doesn't like to assign IPs the normal way when LB class is enabled
		// loadBalancerClass,
		controller: {
			priorityClassName: 'system-cluster-critical',
		},
		speaker: {
			priorityClassName: 'system-cluster-critical',
		},
	},
});

let addresses: string | undefined = undefined;
let pool: k8s.apiextensions.CustomResource | undefined = undefined;
let advertisement: k8s.apiextensions.CustomResource | undefined = undefined;

if (stack === 'pinkdiamond') {
	addresses = '192.168.1.80-192.168.1.89';
	pool = new k8s.apiextensions.CustomResource('pool', {
		apiVersion: 'metallb.io/v1beta1',
		kind: 'IPAddressPool',
		metadata: {
			name: 'pool',
			namespace: ns.metadata.name,
		},
		spec: {
			addresses: [
				'192.168.1.30-192.168.1.65',
				'192.168.1.80-192.168.1.89',
			],
			autoAssign: true,
			avoidBuggyIPs: true,
		},
	}, {
		dependsOn: chart.resources,
		// Would be nice to find a way to ignore just the aggregated manager role rules, not all rules
		ignoreChanges: [
			'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
			'rules', // Aggregated ClusterRole will get rules filled in by controlplane
		],
	});

	advertisement = new k8s.apiextensions.CustomResource('advertisement', {
		apiVersion: 'metallb.io/v1beta1',
		kind: 'L2Advertisement',
		metadata: {
			name: 'advertisement',
			namespace: ns.metadata.name,
		},
		spec: {
			ipAddressPools: [pool.metadata.name],
		},
	}, {
		dependsOn: chart.resources,
		// Would be nice to find a way to ignore just the aggregated manager role rules, not all rules
		ignoreChanges: [
			'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
			'rules', // Aggregated ClusterRole will get rules filled in by controlplane
		],
	});
}

export const poolName = pool?.metadata.name;
export const advertisementName = advertisement?.metadata.name;
export { addresses, loadBalancerClass };
