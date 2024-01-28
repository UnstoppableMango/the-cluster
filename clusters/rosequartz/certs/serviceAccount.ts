import { PrivateKey } from '@pulumi/tls';

export const key = new PrivateKey('service-account', {
  algorithm: 'ECDSA',
});
