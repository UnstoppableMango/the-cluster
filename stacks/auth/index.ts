import * as pulumi from '@pulumi/pulumi';
import * as kx from '@pulumi/kubernetesx';
import { IngressRoute, Middleware } from '@pulumi/crds/traefik/v1alpha1';
import { Project } from '@pulumi/rancher2';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const rancherRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const clusterId = rancherRef.requireOutput('clusterId');

const project = new Project('auth', {
  name: 'Auth',
  clusterId,
});

// const keycloak = new KeyCloak('keycloak', {
//   clusterId,
//   projectId: project.id,
//   version: '2.0.1',
// });

const github = config.requireObject<GitHubConfig>('github');

// https://github.com/thomseddon/traefik-forward-auth
const tfa = new kx.PodBuilder({
  containers: [{
    image: 'thomseddon/traefik-forward-auth:2',
    name: 'traefik-forward-auth',
    ports: [{
      containerPort: 4181,
    }],
    env: {
      PROVIDERS_GENERIC_OAUTH_AUTH_URL: 'https://github.com/login/oauth/authorize',
      PROVIDERS_GENERIC_OAUTH_TOKEN_URL: 'https://github.com/login/oauth/access_token',
      PROVIDERS_GENERIC_OAUTH_USER_URL: 'https://api.github.com/user',
      PROVIDERS_GENERIC_OAUTH_CLIENT_ID: github.clientId,
      PROVIDERS_GENERIC_OAUTH_CLIENT_SECRET: github.clientSecret,
      // PROVIDERS_GENERIC_OAUTH_SCOPE: '',
      // PROVIDERS_GENERIC_OAUTH_TOKEN_STYLE: '',
      // PROVIDERS_GENERIC_OAUTH_RESOURCE: '',
    },
  }],
});

// export const keycloakAdminPassword = pulumi.secret(keycloak.adminPassword.result);
// export const keycloakManagementPassword = pulumi.secret(keycloak.managementPassword.result);
// export const keycloakPostgresqlPassword = pulumi.secret(keycloak.postgresPassword.result);

interface GitHubConfig {
  clientId: string;
  clientSecret: string;
}
