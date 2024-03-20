import { Input, Inputs } from '@pulumi/pulumi';

export type Algorithm = 'RSA' | 'ECDSA' | 'ED25519';

export type AllowedUsage =
  | 'cert_signing'
  | 'client_auth'
  | 'crl_signing'
  | 'digital_signature'
  | 'key_encipherment'
  | 'server_auth';

export type CertType =
  | 'admin'
  | 'kubelet'
  | 'controller-manager'
  | 'kube-proxy'
  | 'kube-scheduler'
  | 'kubernetes'
  | 'service-accounts';

export type EcdsaCurve = 'P224' | 'P256' | 'P384' | 'P521';
