import { output } from '@pulumi/pulumi';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Certificate, ClusterIssuer } from '@unmango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unmango/thecluster-crds/trust/v1alpha1';
import { provider, shared } from '@unmango/thecluster/cluster/from-stack';
import { required } from '@unmango/thecluster';
import { issuer as rootIssuer } from './root';
import { bundles, trustLabel } from '../config';
import { clusterNs } from '../namespace';

// TODO: Common location
const hosts = {
  public: 'kc.thecluster.io',
  internal: 'kc.lan.thecluster.io',
};
const secretName = 'keycloak-ca';

const ns = Namespace.get('keycloak', shared.namespaces.keycloak, { provider });

export const ca = new Certificate('keycloak-ca', {
  metadata: {
    name: 'keycloak-ca',
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
      kind: output(rootIssuer.kind).apply(required),
      name: output(rootIssuer.metadata).apply(x => x?.name ?? ''),
    },
  },
}, { provider });

export const issuer = new ClusterIssuer('keycloak-ca', {
  metadata: { name: 'keycloak-ca' },
  spec: {
    ca: { secretName },
  },
}, { provider });

export const bundle = new Bundle('keycloak-ca', {
  metadata: { name: 'keycloak-ca' },
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
      namespaceSelector: {
        matchLabels: {
          [trustLabel]: 'keycloak',
        },
      },
    },
  },
}, { provider });
