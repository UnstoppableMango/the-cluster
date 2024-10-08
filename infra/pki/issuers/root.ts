import { PrivateKey, SelfSignedCert } from '@pulumi/tls';
import { ns } from '../namespace';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { ClusterIssuer } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unstoppablemango/thecluster-crds/trust/v1alpha1';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { bundles, trustLabel } from '../config';

export const privateKey = new PrivateKey('thecluster.io', {
  algorithm: 'ECDSA',
  rsaBits: 256,
});

// Can/should I use cloudflare instead of doing this myself?
export const ca = new SelfSignedCert('thecluster.io', {
  isCaCertificate: true,
  subject: {
    commonName: 'thecluster.io',
    country: 'US',
    organization: 'UnMango',
    organizationalUnit: 'UnstoppableMango',
  },
  // TODO: What do I need?
  allowedUses: [
    'any_extended',
    'cert_signing',
    'client_auth',
    'code_signing',
    'content_commitment',
    'crl_signing',
    'data_encipherment',
    'email_protection',
    'ipsec_user',
    'key_agreement',
    'key_encipherment',
    'server_auth',
    'ocsp_signing',
    'timestamping',
  ],
  privateKeyPem: privateKey.privateKeyPem,
  validityPeriodHours: 25 * 365 * 24, // Intent: 25 years
});

export const secret = new Secret('root-ca', {
  metadata: {
    name: 'root-ca',
    namespace: ns.metadata.name,
  },
  type: 'kubernetes.io/tls',
  stringData: {
    'tls.crt': ca.certPem,
    'tls.key': privateKey.privateKeyPem,
  },
}, { provider });

export const issuer = new ClusterIssuer('thecluster.io', {
  metadata: { name: 'thecluster.io' },
  spec: {
    ca: {
      secretName: secret.metadata.name,
    },
  },
}, { provider });

export const bundle = new Bundle('root-ca', {
  metadata: { name: 'root-ca' },
  spec: {
    sources: [
      {
        secret: {
          name: secret.metadata.name,
          key: 'tls.crt',
        },
      },
    ],
    target: {
      configMap: { key: bundles.key },
      additionalFormats: {
        jks: { key: bundles.jksKey },
        pkcs12: { key: bundles.p12Key },
      },
      namespaceSelector: {
        matchLabels: {
          [trustLabel]: 'root',
        },
      },
    },
  },
}, { provider });
