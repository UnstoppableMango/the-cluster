// import { ComponentResource, ComponentResourceOptions, output } from '@pulumi/pulumi';
// import { Namespace } from '@pulumi/kubernetes/core/v1';
// import { Certificate, ClusterIssuer } from '@unstoppablemango/thecluster-crds/certmanager/v1';
// import { Bundle } from '@unstoppablemango/thecluster-crds/trust/v1alpha1';
// import { provider, shared } from '@unstoppablemango/thecluster/cluster/from-stack';
// import { required } from '@unstoppablemango/thecluster';
// import { issuer as rootIssuer } from './root';
// import { trustLabel } from '../config';
// import { clusterNs } from '../namespace';

// export class CertificateAuthority extends ComponentResource {
//   public namespace: Namespace;
//   public ca: Certificate;

//   constructor(public secretName: string, opts?: ComponentResourceOptions) {
//     super('type', 'name', {}, opts)
//   }
// }

// // TODO: Common location
// const hosts = {
//   public: 'pg.thecluster.io',
//   internal: 'pg.lan.thecluster.io',
// };
// const secretName = 'postgres-ca';

// const ns = Namespace.get('postgres', shared.postgresNamespace, { provider });

// export const ca = new Certificate('postgres-ca', {
//   metadata: {
//     name: 'postgres-ca',
//     namespace: clusterNs.metadata.name,
//   },
//   spec: {
//     isCA: true,
//     commonName: hosts.public,
//     secretName,
//     privateKey: {
//       algorithm: 'ECDSA',
//       size: 256,
//     },
//     issuerRef: {
//       group: 'cert-manager.io',
//       kind: output(rootIssuer.kind).apply(required),
//       name: output(rootIssuer.metadata).apply(x => x?.name ?? ''),
//     },
//   },
// }, { provider });

// export const issuer = new ClusterIssuer('postgres-ca', {
//   metadata: { name: 'postgres-ca' },
//   spec: {
//     ca: { secretName },
//   },
// }, { provider });

// export const bundle = new Bundle('postgres-ca', {
//   metadata: { name: 'postgres-ca' },
//   spec: {
//     sources: [
//       {
//         secret: {
//           name: secretName,
//           key: 'ca.crt',
//         },
//       },
//     ],
//     target: {
//       secret: { key: 'ca-certificates.crt' },
//       namespaceSelector: {
//         matchLabels: {
//           [trustLabel]: 'postgres',
//         },
//       },
//     },
//   },
// }, { provider });
