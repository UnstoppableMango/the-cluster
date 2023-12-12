import { Config, getStack } from '@pulumi/pulumi';

export const cluster = getStack();

const test = import('./apps');
test.then(x => x.keycloakProvider);
