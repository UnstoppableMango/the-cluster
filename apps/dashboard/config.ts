import { Config, getStack } from '@pulumi/pulumi';

const config = new Config();

export const cluster = getStack();
export const publicHost = config.require('publicHost');
export const internalHost = config.require('internalHost');
