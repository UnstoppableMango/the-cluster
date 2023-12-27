import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unmango/thecluster/cluster/from-stack';

const mediaNs = new Namespace('media', {
  metadata: { name: 'media' },
}, { provider });

const postgresNs = new Namespace('postgres', {
  metadata: { name: 'postgres' },
}, { provider });

const keycloakNs = new Namespace('keycloak', {
  metadata: {
    name: 'keycloak',
    labels: {
      'thecluster.io/trust': 'postgres',
    },
  },
}, { provider });

const pgadminNs = new Namespace('pgadmin', {
  metadata: {
    name: 'pgadmin',
    labels: {
      'thecluster.io/trust': 'postgres',
    },
  },
}, { provider });

const pulumiOperator = new Namespace('pulumi-operator', {
  metadata: { name: 'pulumi-operator' },
}, { provider });

export const namespaces = {
  media: mediaNs.metadata.name,
  postgres: postgresNs.metadata.name,
  keycloak: keycloakNs.metadata.name,
  pgadmin: pgadminNs.metadata.name,
  pulumiOperator: pulumiOperator.metadata.name,
};
