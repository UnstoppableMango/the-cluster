import { Config, getStack } from '@pulumi/pulumi';

const config = new Config();
export const cluster = getStack();
