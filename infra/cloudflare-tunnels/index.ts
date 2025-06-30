import { ConfigMap, Secret } from '@pulumi/kubernetes/core/v1';
import { interpolate } from '@pulumi/pulumi';
import { ClusterTunnel } from '@unstoppablemango/thecluster-crds/networking/v1alpha1';
import { apiSecretsName, caPem, cloudflare, operatorNamespace, tunnels, versions } from './config';

const kubeRootCa = ConfigMap.get('kube-root-ca.crt', 'kube-system/kube-root-ca.crt');

const secret = new Secret('origin-ca-pool', {
	metadata: {
		name: 'origin-ca-pool',
		namespace: operatorNamespace,
	},
	stringData: {
		'kube-root-ca.crt': kubeRootCa.data.apply(x => x['ca.crt']),
		'tls.crt': caPem,
	},
});

const credentialsId = interpolate`${operatorNamespace}/${apiSecretsName}`;
const credentials = Secret.get('credentials', credentialsId);

tunnels.map(t =>
	new ClusterTunnel(t.name, {
		metadata: { name: t.name },
		spec: {
			newTunnel: {
				name: t.name,
			},
			size: t.size,
			originCaPool: secret.metadata.name,
			image: `cloudflare/cloudflared:${versions.cloudflared}`,
			cloudflare: {
				accountId: cloudflare.accountId,
				domain: t.domain,
				email: cloudflare.email,
				secret: credentials.metadata.name,
			},
		},
	})
);

export const tunnelNames = tunnels.map(x => x.name);
