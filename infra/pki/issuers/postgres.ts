import { output } from '@pulumi/pulumi';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { Certificate, Issuer } from '@unmango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unmango/thecluster-crds/trust/v1alpha1';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { required } from '@unmango/thecluster';
import { ns } from '../namespace';
import { issuer as rootIssuer } from './root';

export const hostname = 'postgres.thecluster.io'; // TODO
export const secret = new Secret(hostname, {
  metadata: {
    name: hostname,
    namespace: ns.metadata.name,
  },
  type: 'kubernetes.io/tls',
}, { provider });

export const ca = new Certificate(hostname, {
  metadata: {
    name: hostname,
    namespace: ns.metadata.name,
  },
  spec: {
    isCA: true,
    commonName: hostname,
    dnsNames: ['postgres-ha.thecluster.io'], // TODO
    secretName: secret.metadata.name,
    privateKey: {
      algorithm: 'ECDSA',
      size: 256,
    },
    issuerRef: {
      group: 'cert-manager.io',
      kind: output(rootIssuer.kind).apply(required),
      name: output(rootIssuer.metadata).apply(x => x?.name ?? ''),
    },
  },
}, { provider });

export const issuer = new Issuer(hostname, {
  metadata: {
    name: hostname,
    namespace: ns.metadata.name,
  },
  spec: {
    ca: {
      secretName: secret.metadata.name,
    },
  },
}, { provider });

export const bundle = new Bundle(hostname, {
  metadata: { name: hostname },
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
        key: 'postgres-bundle.pem',
      },
      additionalFormats: {
        jks: { key: 'bundle.jks' },
        pkcs12: { key: 'bundle.p12' },
      },
      namespaceSelector: {
        matchLabels: {
          'thecluster.io/inject-postgres-cert': 'true',
        },
      },
    },
  },
}, { provider });
