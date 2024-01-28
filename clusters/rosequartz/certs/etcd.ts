import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';
import { caCert, earlyRenewalHours, validityPeriodHours } from '../config';

// https://github.com/siderolabs/talos/blob/cf0603330a5c852163642a6b3844d1dcc3892cf6/pkg/machinery/config/generate/secrets/ca.go#L20

export const key = new PrivateKey('etcd', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

const request = new CertRequest('etcd', {
  privateKeyPem: key.privateKeyPem,
  subject: { organization: 'etcd' },
});

export const cert = new LocallySignedCert('etcd', {
  allowedUses: ['digital_signature', 'cert_signing', 'client_auth', 'server_auth'],
  caCertPem: caCert.certPem,
  caPrivateKeyPem: key.privateKeyPem,
  certRequestPem: request.certRequestPem,
  earlyRenewalHours,
  validityPeriodHours,
  isCaCertificate: true,
  setSubjectKeyId: true,
});
