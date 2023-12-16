import { PrivateKey, SelfSignedCert } from '@pulumi/tls';
import { ns } from '../namespace';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { ClusterIssuer } from '@unmango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unmango/thecluster-crds/trust/v1alpha1';
import { Secret } from '@pulumi/kubernetes/core/v1';

export const privateKey = new PrivateKey('thecluster.io', {
  algorithm: 'ECDSA',
  rsaBits: 256,
});

// Can I use cloudflare instead of doing this myself?
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

export const secret = new Secret('thecluster.io', {
  metadata: {
    name: 'thecluster.io',
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

export const bundle = new Bundle('thecluster.io', {
  metadata: { name: 'thecluster.io' },
  spec: {
    sources: [
      { useDefaultCAs: true },
      {
        secret: {
          name: secret.metadata.name,
          key: 'tls.crt',
        },
      },
    ],
    target: {
      configMap: {
        key: 'bundle.pem',
      },
      additionalFormats: {
        jks: { key: 'bundle.jks' },
        pkcs12: { key: 'bundle.p12' },
      },
      namespaceSelector: {
        matchLabels: {
          'thecluster.io/inject-root-cert': 'true',
        },
      },
    },
  },
}, { provider });
