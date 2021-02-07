import * as pulumi from '@pulumi/pulumi';
import { Project } from '@pulumi/rancher2';
import { KeyCloak } from './resources';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const rancherRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const clusterId = rancherRef.requireOutput('clusterId');

const project = new Project('auth', {
  name: 'Auth',
  clusterId: clusterId,
});

const keycloak = new KeyCloak('keycloak', {
  projectId: project.id,
  version: '2.0.0',
});

export const keycloakAdminPassword = pulumi.secret(keycloak.adminPassword.result);
export const keycloakManagementPassword = pulumi.secret(keycloak.managementPassword.result);
export const keycloakPostgresqlPassword = pulumi.secret(keycloak.postgresPassword.result);
