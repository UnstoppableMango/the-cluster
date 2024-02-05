import { CertRequest, PrivateKey } from '@pulumi/tls';
import { OriginCaCertificate } from '@pulumi/cloudflare';

export const key = new PrivateKey('cloudflare', {
  algorithm: 'RSA',
  rsaBits: 2048,
});

const request = new CertRequest('cloudflare', {
  privateKeyPem: key.privateKeyPem,
  subject: { organization: 'UnMango' },
});

export const cert = new OriginCaCertificate('cloudflare', {
  csr: request.certRequestPem,
  hostnames: ['thecluster.io', '*.thecluster.io'],
  requestType: 'origin-rsa',
  // TODO: Validity and renewal
});
