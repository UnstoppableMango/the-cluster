import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';
import { caCert, earlyRenewalHours, validityPeriodHours } from '../config';

export const key = new PrivateKey('aggregator', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

const request = new CertRequest('aggregator', {
  privateKeyPem: key.privateKeyPem,
});

const test = new LocallySignedCert('aggregator', {
  allowedUses: ['digital_signature', 'cert_signing', 'client_auth', 'server_auth'],
  caCertPem: caCert.certPem,
  caPrivateKeyPem: key.privateKeyPem,
  certRequestPem: request.certRequestPem,
  earlyRenewalHours,
  validityPeriodHours,
});
