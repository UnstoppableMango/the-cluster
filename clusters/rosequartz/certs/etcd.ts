import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';
import { caCert, earlyRenewalHours, validityPeriodHours } from '../config';

export const key = new PrivateKey('etcd', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

const request = new CertRequest('etcd', {
  privateKeyPem: key.privateKeyPem,
});

const test = new LocallySignedCert('etcd', {
  allowedUses: ['digital_signature', 'cert_signing', 'client_auth', 'server_auth'],
  caCertPem: caCert.certPem,
  caPrivateKeyPem: key.privateKeyPem,
  certRequestPem: request.certRequestPem,
  earlyRenewalHours,
  validityPeriodHours,
  isCaCertificate: true,
  setSubjectKeyId: true,
});
