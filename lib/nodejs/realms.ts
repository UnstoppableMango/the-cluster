import { interpolate, Output, StackReference } from '@pulumi/pulumi';
import { hostname } from './apps/keycloak';
import { cluster } from './config';
import { IdentityOutputs } from './types';

const ref = new StackReference('identity', {
  name: `UnstoppableMango/thecluster-identity/${cluster}`,
});

export const realms = ref.requireOutput('realms') as Output<IdentityOutputs['realms']>;
export const groups = ref.requireOutput('groups') as Output<IdentityOutputs['groups']>;
export const groupsScopeName = ref.requireOutput('groupsScopeName') as Output<string>;
export const groupNames = ref.requireOutput('groupNames') as Output<IdentityOutputs['groupNames']>;
const externalIssuerUrl = interpolate`https://${hostname}/realms/${realms.external.id}`;
export const external = {
  realm: realms.external.id,
  issuerUrl: externalIssuerUrl,
  tokenUrl: interpolate`${externalIssuerUrl}/protocol/openid-connect/token`,
  authorizationUrl: interpolate`${externalIssuerUrl}/protocol/openid-connect/auth`,
  apiBaseUrl: interpolate`https://${hostname}/protocol/openid-connect`,
  userinfoEndpoint: interpolate`${externalIssuerUrl}/protocol/openid-connect/userinfo`,
};
