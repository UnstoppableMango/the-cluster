import { PrivateKey, SelfSignedCert } from '@pulumi/tls';

export const key = new PrivateKey('k8s', {
  algorithm: 'ECDSA',
});

export const cert = new SelfSignedCert('k8s', {
  allowedUses: [],
  privateKeyPem: key.privateKeyPem,
  validityPeriodHours: 25 * 365 * 24, // Intent: 25 years
});
