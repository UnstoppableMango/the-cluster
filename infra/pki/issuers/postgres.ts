import { output } from '@pulumi/pulumi';
import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Certificate, Issuer } from '@unmango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unmango/thecluster-crds/trust/v1alpha1';
import { provider, shared } from '@unmango/thecluster/cluster/from-stack';
import { required } from '@unmango/thecluster';
import { issuer as rootIssuer } from './root';

// TODO: Common location
const hosts = {
  public: 'postgres.thecluster.io',
  internal: 'postgres.lan.thecluster.io',
};
const secretName = 'postgres-ca';

const ns = Namespace.get('postgres', shared.postgresNamespace, { provider });

export const ca = new Certificate('postgres-ca', {
  metadata: {
    name: 'postgres-ca',
    namespace: ns.metadata.name,
  },
  spec: {
    isCA: true,
    commonName: hosts.public,
    secretName,
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

export const issuer = new Issuer('postgres', {
  metadata: {
    name: 'postgres',
    namespace: ns.metadata.name,
  },
  spec: {
    ca: { secretName },
  },
}, { provider });

export const bundle = new Bundle('postgres-ca', {
  metadata: { name: 'postgres-ca' },
  spec: {
    sources: [
      { useDefaultCAs: true },
      {
        secret: {
          name: secretName,
          key: 'ca.crt',
        },
      },
    ],
    target: {
      secret: { key: 'ca-certificates.crt' },
      namespaceSelector: {
        matchLabels: {
          'thecluster.io/inject-postgres-cert': 'true',
        },
      },
    },
  },
}, { provider });
