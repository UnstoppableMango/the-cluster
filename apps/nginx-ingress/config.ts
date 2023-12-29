import { Config, getStack } from '@pulumi/pulumi';

const config = new Config();

export const cluster = getStack().split('-')[0];
export const ip = config.require('ip');
