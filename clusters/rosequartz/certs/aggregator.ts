import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';
import { caCert, earlyRenewalHours, validityPeriodHours } from '../config';

// https://github.com/siderolabs/talos/blob/cf0603330a5c852163642a6b3844d1dcc3892cf6/pkg/machinery/config/generate/secrets/ca.go#L64

export const key = new PrivateKey('aggregator', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

const request = new CertRequest('aggregator', {
  privateKeyPem: key.privateKeyPem,
  subject: { commonName: 'front-proxy' },
});

export const cert = new LocallySignedCert('aggregator', {
  allowedUses: ['digital_signature', 'cert_signing', 'client_auth', 'server_auth'],
  caCertPem: caCert.certPem,
  caPrivateKeyPem: key.privateKeyPem,
  certRequestPem: request.certRequestPem,
  earlyRenewalHours,
  validityPeriodHours,
});
