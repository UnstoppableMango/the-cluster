import { Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { Grant, Provider, Role } from '@pulumi/postgresql';
import { interpolate } from '@pulumi/pulumi';
import { Certificate } from '@unmango/thecluster-crds/certmanager/v1';
import { apps, clusterIssuers, shared, system } from '@unmango/thecluster/cluster/from-stack';
import { b64decode } from '@unmango/thecluster/util';

const k8sOpts = { provider: system.provider };
const ns = Namespace.get('postgres', shared.namespaces.postgres, k8sOpts);
const secret = Secret.get('cert', interpolate`${ns.metadata.name}/postgres-cert`, k8sOpts);
const provider = new Provider('postgres', {
  host: apps.postgresqlLa.hosts.internal,
  database: apps.postgresqlLa.database,
  clientcert: {
    sslinline: true,
    cert: secret.data.apply(d => d['tls.crt']).apply(b64decode),
    key: secret.data.apply(d => d['tls.key']).apply(b64decode),
  },
});

const pulumi = new Role('pulumi', {
  name: 'pulumi',
  login: true,
  // roles: [],
  superuser: false,
  createDatabase: true,
  createRole: true,
}, { provider });

// const grant = new Grant('schema', {
//   database: apps.postgresqlLa.database,
//   role: pulumi.name,
//   objectType: 'database',
//   privileges: ['CONNECT'],
// }, { provider });

const pulumiCert = new Certificate('pulumi', {
  metadata: {
    name: 'pulumi',
    namespace: ns.metadata.name,
  },
  spec: {
    issuerRef: clusterIssuers.ref(x => x.postgres),
    secretName: 'pulumi-cert',
    usages: ['client auth'],
    commonName: 'pulumi',
    duration: '2160h0m0s', // 90d
    renewBefore: '360h0m0s', // 15d
    privateKey: {
      algorithm: 'RSA',
      encoding: 'PKCS1',
      size: 2048,
    },
  },
}, k8sOpts);

const unmango = new Role('unmango', {
  name: 'unmango',
  login: true,
  // roles: [],
  superuser: false,
  createDatabase: true,
  createRole: true,
}, { provider });

// const grant = new Grant('schema', {
//   database: apps.postgresqlLa.database,
//   role: pulumi.name,
//   objectType: 'database',
//   privileges: ['CONNECT'],
// }, { provider });

const unmangoCert = new Certificate('unmango', {
  metadata: {
    name: 'unmango',
    namespace: ns.metadata.name,
  },
  spec: {
    issuerRef: clusterIssuers.ref(x => x.postgres),
    secretName: 'unmango-cert',
    usages: ['client auth'],
    commonName: 'unmango',
    duration: '2160h0m0s', // 90d
    renewBefore: '360h0m0s', // 15d
    privateKey: {
      algorithm: 'RSA',
      encoding: 'PKCS1',
      size: 2048,
    },
  },
}, k8sOpts);

export const pulumiCertSecret = pulumiCert.spec.apply(x => x?.secretName);
