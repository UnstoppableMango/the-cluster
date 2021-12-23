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

const basicAuth = config.requireObject<BasicAuthConfig>('basic');
const basicSecret = new kx.Secret('basic-auth', {
  metadata: {
    name: 'basic-auth',
    namespace: 'traefik-system',
  },
  stringData: {
    // TODO: Find out how to support multiple users
    users: basicAuth.users[0],
  },
});

const basicMiddleware = new Middleware('basic-auth', {
  metadata: {
    name: 'basic-auth',
    namespace: 'traefik-system',
  },
  spec: {
    basicAuth: {
      secret: basicSecret.metadata.name,
      removeHeader: true,
    },
  },
});

const faNamespace = new rancher.Namespace('forward-auth', {
  name: 'forward-auth',
  projectId: project.id,
});

const github = config.requireObject<GitHubConfig>('github');
const faSecret = new kx.Secret('forward-auth', {
  metadata: {
    name: 'forward-auth',
    namespace: faNamespace.name,
  },
  stringData: {
    'github-client-id': github.clientId,
    'github-client-secret': github.clientSecret,
  },
});

// https://github.com/thomseddon/traefik-forward-auth
// const tfapb = new kx.PodBuilder({
//   containers: [{
//     image: 'thomseddon/traefik-forward-auth:2',
//     name: 'traefik-forward-auth',
//     ports: [{
//       containerPort: tfaPort,
//     }],
//     env: {
//       AUTH_HOST: 'auth.thecluster.io',
//       COOKIE_DOMAIN: 'thecluster.io',
//       DEFAULT_PROVIDER: 'generic-oauth',
//       PROVIDERS_GENERIC_OAUTH_AUTH_URL: 'https://github.com/login/oauth/authorize',
//       PROVIDERS_GENERIC_OAUTH_TOKEN_URL: 'https://github.com/login/oauth/access_token',
//       PROVIDERS_GENERIC_OAUTH_USER_URL: 'https://api.github.com/user',
//       PROVIDERS_GENERIC_OAUTH_CLIENT_ID: faSecret.asEnvValue('github-client-id'),
//       PROVIDERS_GENERIC_OAUTH_CLIENT_SECRET: faSecret.asEnvValue('github-client-secret'),
//       // PROVIDERS_GENERIC_OAUTH_SCOPE: '',
//       // PROVIDERS_GENERIC_OAUTH_TOKEN_STYLE: '',
//       // PROVIDERS_GENERIC_OAUTH_RESOURCE: '',
//       SECRET: faSecret.asEnvValue('secret'),
//     },
//   }],
// });

// const faDeployment = new kx.Deployment('forward-auth', {
//   metadata: {
//     name: 'forward-auth',
//     namespace: faNamespace.name,
//   },
//   spec: tfapb.asDeploymentSpec({
//     strategy: { type: 'Recreate' },
//   }),
// });

// const faService = faDeployment.createService({
//   type: kx.types.ServiceType.ClusterIP,
//   ports: [{ port: tfaPort }],
// });

// const tfaIngressRoute = new IngressRoute('forward-auth', {
//   metadata: {
//     name: 'forward-auth',
//     namespace: faNamespace.name,
//   },
//   spec: {
//     entryPoints: ['websecure'],
//     routes: [{
//       kind: 'Rule',
//       match: 'Host(`auth.thecluster.io`)',
//       services: [{
//         name: faService.metadata.name,
//         port: tfaPort,
//       }],
//     }],
//   },
// });

// const tfaMiddleware = new Middleware('traefik-forward-auth', {
//   metadata: {
//     name: 'traefik-forward-auth',
//     namespace: tfaNamespace.name,
//   },
//   spec: {
//     forwardAuth: {
//       address: pulumi.interpolate`http://${tfaService.metadata.name}:${tfaPort}`,
//       authResponseHeaders: ['X-Forwarded-User'],
//     },
//   },
// });

// export const keycloakAdminPassword = pulumi.secret(keycloak.adminPassword.result);
// export const keycloakManagementPassword = pulumi.secret(keycloak.managementPassword.result);
// export const keycloakPostgresqlPassword = pulumi.secret(keycloak.postgresPassword.result);

interface GitHubConfig {
  clientId: string;
  clientSecret: string;
}

interface BasicAuthConfig {
  // Should be user:hashed-password
  users: string[];
}
