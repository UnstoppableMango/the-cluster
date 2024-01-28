import { PrivateKey, SelfSignedCert } from '@pulumi/tls';

const key = new PrivateKey('thecluster', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

const ca = new SelfSignedCert('thecluster', {
  subject: { 
    commonName: 'THECLUSTER Authority',
    organization: 'UnMango',
    country: 'US',
  },
  isCaCertificate: true,
  allowedUses: ['cert_signing', 'crl_signing', 'digital_signature'],
  privateKeyPem: key.privateKeyPem,
  validityPeriodHours: 25 * 365 * 24, // Intent: 25 years
  earlyRenewalHours: 7 * 24, // Intent: 1 week
})

export const keyId = key.id;
export const caId = ca.id;
