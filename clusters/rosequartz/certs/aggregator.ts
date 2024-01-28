import { PrivateKey, SelfSignedCert } from '@pulumi/tls';

export const key = new PrivateKey('aggregator', {
  algorithm: 'ECDSA',
});

export const cert = new SelfSignedCert('aggregator', {
  allowedUses: [],
  privateKeyPem: key.privateKeyPem,
  validityPeriodHours: 25 * 365 * 24, // Intent: 25 years
});
