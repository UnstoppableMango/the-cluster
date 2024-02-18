import { PrivateKey } from '@pulumi/tls';

// https://github.com/siderolabs/crypto/blob/8f77da30a5193d207a6660b562a273a06d73aae0/x509/x509.go#L385

export const key = new PrivateKey('service-account', {
  algorithm: 'ECDSA',
  ecdsaCurve: 'P256',
});
