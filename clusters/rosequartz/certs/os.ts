import { PrivateKey, SelfSignedCert } from '@pulumi/tls';

export const key = new PrivateKey('os', {
  algorithm: 'ECDSA',
});

export const cert = new SelfSignedCert('os', {
  allowedUses: [],
  privateKeyPem: key.privateKeyPem,
  validityPeriodHours: 25 * 365 * 24, // Intent: 25 years
});
