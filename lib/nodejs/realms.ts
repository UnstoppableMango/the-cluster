import { interpolate } from '@pulumi/pulumi';
import { realm, hostname } from './apps/keycloak';


const externalIssuerUrl = interpolate`https://${hostname}/realms/${realm}`;
export const external = {
  realm,
  issuerUrl: externalIssuerUrl,
  tokenUrl: interpolate`${externalIssuerUrl}/protocol/openid-connect/token`,
  authorizationUrl: interpolate`${externalIssuerUrl}/protocol/openid-connect/auth`,
  apiBaseUrl: interpolate`https://${hostname}/protocol/openid-connect`,
  userinfoEndpoint: interpolate`${externalIssuerUrl}/protocol/openid-connect/userinfo`,
};
