import { output } from '@pulumi/pulumi';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { Certificate, ClusterIssuer } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { Bundle } from '@unstoppablemango/thecluster-crds/trust/v1alpha1';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { required } from '@unstoppablemango/thecluster';
import { ns } from '../namespace';
import { trustLabel } from '../config';
import { issuer as rootIssuer } from './root';

export const hostname = 'lan.thecluster.io'; // TODO: Move to config
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

export const issuer = new ClusterIssuer(hostname, {
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
          key: 'ca.crt',
        },
      },
    ],
    target: {
      secret: { key: 'ca-certifcates.crt' },
      namespaceSelector: {
        matchLabels: {
          [trustLabel]: 'lan',
        },
      },
    },
  },
}, { provider });
