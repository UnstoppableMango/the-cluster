import { PrivateKey, SelfSignedCert } from '@pulumi/tls';

export const key = new PrivateKey('etcd', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

export const cert = new SelfSignedCert('etcd', {
  allowedUses: [],
  privateKeyPem: key.privateKeyPem,
  validityPeriodHours: 25 * 365 * 24, // Intent: 25 years
});
