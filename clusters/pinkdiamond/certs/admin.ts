import { CertRequest, LocallySignedCert, PrivateKey } from '@pulumi/tls';
import { earlyRenewalHours } from '../config';
import * as os from './os';

// https://github.com/siderolabs/talos/blob/cf0603330a5c852163642a6b3844d1dcc3892cf6/pkg/machinery/config/generate/secrets/ca.go#L93

export const key = new PrivateKey('admin', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});

const request = new CertRequest('admin', {
  privateKeyPem: key.privateKeyPem,
  subject: { organization: 'os:admin' },
});

export const cert = new LocallySignedCert('admin', {
  allowedUses: ['client_auth', 'digital_signature'],
  caCertPem: os.cert.certPem,
  caPrivateKeyPem: os.key.privateKeyPem,
  certRequestPem: request.certRequestPem,
  earlyRenewalHours,
  validityPeriodHours: 365 * 24, // Intent: 1 year
  setSubjectKeyId: true,
});
