import { interpolate } from '@pulumi/pulumi';
import { realm, hostname } from './apps/keycloak';

export { realm as external };
export const externalIssuerUrl = interpolate`https://${hostname}/realms/${realm}`;
