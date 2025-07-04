import { StackReference } from '@pulumi/pulumi';
import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';

const _25Years = 25 * 365 * 24;
const _1Week = 7 * 24;

const pki = new StackReference('pki', {
	name: 'UnstoppableMango/pki/prod',
});

export const key = new PrivateKey('thecluster.io', {
	algorithm: 'RSA',
	rsaBits: 4096,
});

export const request = new CertRequest('thecluster.io', {
	privateKeyPem: key.privateKeyPem,
	subject: {
		commonName: 'thecluster.io',
		country: 'US',
		organization: 'UnMango',
		organizationalUnit: 'UnstoppableMango',
	},
	uris: [],
	dnsNames: [],
	ipAddresses: [],
});

export const cert = new LocallySignedCert('thecluster.io', {
	isCaCertificate: true,
	allowedUses: [
		'cert_signing',
		'crl_signing',
		'digital_signature',
	],
	caCertPem: ca.cert.certPem,
	caPrivateKeyPem: ca.key.privateKeyPem,
	certRequestPem: request.certRequestPem,
	validityPeriodHours: _25Years,
	earlyRenewalHours: _1Week,
});
