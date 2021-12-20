import * as pulumi from '@pulumi/pulumi';
import * as kx from '@pulumi/kubernetesx';
import * as rancher from '@pulumi/rancher2';
import * as random from '@pulumi/random';
import { IngressRoute, Middleware } from '@pulumi/crds/traefik/v1alpha1';

const config = new pulumi.Config();
const remoteStack = config.require('remoteStack');

const rancherRef = new pulumi.StackReference(`UnstoppableMango/rancher/${remoteStack}`);
const clusterId = rancherRef.requireOutput('clusterId');

const project = new rancher.Project('auth', {
  name: 'Auth',
  clusterId,
});

// const keycloak = new KeyCloak('keycloak', {
//   clusterId,
//   projectId: project.id,
//   version: '2.0.1',
// });

const tfaNamespace = new rancher.Namespace('traefik-forward-auth', {
  name: 'traefik-forward-auth',
  projectId: project.id,
});

const github = config.requireObject<GitHubConfig>('github');

const tfaSecretString = new random.RandomString('traefik-forward-auth', {
  length: 69,
});

const tfaSecret = new kx.Secret('traefik-forward-auth', {
  metadata: {
    name: 'traefik-forward-auth',
    namespace: tfaNamespace.name,
  },
  stringData: {
    'github-client-id': github.clientId,
    'github-client-secret': github.clientSecret,
    secret: tfaSecretString.result,
  },
});

const tfaPort = 4181;

// https://github.com/thomseddon/traefik-forward-auth
const tfapb = new kx.PodBuilder({
  containers: [{
    image: 'thomseddon/traefik-forward-auth:2',
    name: 'traefik-forward-auth',
    ports: [{
      containerPort: tfaPort,
    }],
    env: {
      AUTH_HOST: 'auth.thecluster.io',
      COOKIE_DOMAIN: 'thecluster.io',
      DEFAULT_PROVIDER: 'generic-oauth',
      PROVIDERS_GENERIC_OAUTH_AUTH_URL: 'https://github.com/login/oauth/authorize',
      PROVIDERS_GENERIC_OAUTH_TOKEN_URL: 'https://github.com/login/oauth/access_token',
      PROVIDERS_GENERIC_OAUTH_USER_URL: 'https://api.github.com/user',
      PROVIDERS_GENERIC_OAUTH_CLIENT_ID: tfaSecret.asEnvValue('github-client-id'),
      PROVIDERS_GENERIC_OAUTH_CLIENT_SECRET: tfaSecret.asEnvValue('github-client-secret'),
      // PROVIDERS_GENERIC_OAUTH_SCOPE: '',
      // PROVIDERS_GENERIC_OAUTH_TOKEN_STYLE: '',
      // PROVIDERS_GENERIC_OAUTH_RESOURCE: '',
      SECRET: tfaSecret.asEnvValue('secret'),
    },
  }],
});

const tfaDeployment = new kx.Deployment('traefik-forward-auth', {
  metadata: {
    name: 'traefik-forward-auth',
    namespace: tfaNamespace.name,
  },
  spec: tfapb.asDeploymentSpec({
    strategy: { type: 'Recreate' },
  }),
});

const tfaService = tfaDeployment.createService({
  type: kx.types.ServiceType.ClusterIP,
  ports: [{ port: tfaPort }],
});

const tfaIngressRoute = new IngressRoute('traefik-forward-auth', {
  metadata: {
    name: 'traefik-forward-auth',
    namespace: tfaNamespace.name,
  },
  spec: {
    entryPoints: ['websecure'],
    routes: [{
      kind: 'Rule',
      match: 'Host(`auth.thecluster.io`)',
      services: [{
        name: tfaService.metadata.name,
        port: tfaPort,
      }],
    }],
  },
});

const tfaMiddleware = new Middleware('traefik-forward-auth', {
  metadata: {
    name: 'traefik-forward-auth',
    namespace: tfaNamespace.name,
  },
  spec: {
    forwardAuth: {
      address: pulumi.interpolate`http://${tfaService.metadata.name}:${tfaPort}`,
      authResponseHeaders: ['X-Forwarded-User'],
    },
  },
});

// export const keycloakAdminPassword = pulumi.secret(keycloak.adminPassword.result);
// export const keycloakManagementPassword = pulumi.secret(keycloak.managementPassword.result);
// export const keycloakPostgresqlPassword = pulumi.secret(keycloak.postgresPassword.result);

interface GitHubConfig {
  clientId: string;
  clientSecret: string;
}
