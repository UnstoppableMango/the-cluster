import { output } from '@pulumi/pulumi';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Certificate, ClusterIssuer } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unstoppablemango/thecluster-crds/trust/v1alpha1';
import { provider, shared } from '@unstoppablemango/thecluster/cluster/from-stack';
import { required } from '@unstoppablemango/thecluster';
import * as root from './root';
import { bundles, trustLabel } from '../config';
import { clusterNs } from '../namespace';

// TODO: Common location
const hosts = {
  public: 'pg.thecluster.io',
  internal: 'pg.lan.thecluster.io',
};
const secretName = 'postgres-ca';

const ns = Namespace.get('postgres', shared.namespaces.postgres, { provider });

export const ca = new Certificate('postgres-ca', {
  metadata: {
    name: 'postgres-ca',
    namespace: clusterNs.metadata.name,
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
      kind: output(root.issuer.kind).apply(required),
      name: output(root.issuer.metadata).apply(x => x?.name ?? ''),
    },
  },
}, { provider });

export const issuer = new ClusterIssuer('postgres-ca', {
  metadata: { name: 'postgres-ca' },
  spec: {
    ca: { secretName },
  },
}, { provider });

export const bundle = new Bundle('postgres-ca', {
  metadata: { name: 'postgres-ca' },
  spec: {
    sources: [
      {
        secret: {
          name: secretName,
          key: 'ca.crt',
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
          [trustLabel]: 'postgres',
        },
      },
    },
  },
}, { provider });
