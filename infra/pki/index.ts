import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { Config, Output, StackReference } from '@pulumi/pulumi';
import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';
import * as z from 'zod/v4';

const CA = z.object({
	certPem: z.string(),
	privateKeyPem: z.string(),
});

const CloudflareConfig = z.object({
	apiToken: z.string(),
});

type CA = z.infer<typeof CA>;
type CloudflareConfig = z.infer<typeof CloudflareConfig>;

const _25Years = 25 * 365 * 24;
const _1Week = 7 * 24;

const config = new Config();

const pki = new StackReference('pki', {
	name: 'UnstoppableMango/pki/prod',
});

const ca = pki.requireOutput('thecluster').apply(CA.parse);
const cf = config.requireSecretObject('cloudflare').apply(CloudflareConfig.parse);

const apiTokenKey = 'api-token';
const secret = new Secret('cloudflare', {
	metadata: {},
	stringData: {
		[apiTokenKey]: cf.apiToken,
	},
});

const cfIssuer = new CustomResource('cloudflare', {
	apiVersion: 'cert-manager.io/v1',
	kind: 'Issuer',
	metadata: { namespace: '' },
	spec: {
		acme: {
			server: '',
			solvers: [{
				dns01: {
					cloudflare: {
						apiTokenSecretRef: {
							name: secret.metadata.name,
							key: apiTokenKey,
						},
					},
				},
			}],
		},
	},
});
