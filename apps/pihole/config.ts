import { Config, getStack } from '@pulumi/pulumi';

const config = new Config();
export const cluster = getStack();
export const ip = config.require('ip');
