import { Config, getStack } from '@pulumi/pulumi';

const config = new Config();
export const clusterName = config.require('clusterName');
export const stackName = getStack();
