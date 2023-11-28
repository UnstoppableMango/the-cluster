import { getStack, Config } from '@pulumi/pulumi';

const config = new Config();

export const stack = getStack();
export const loadBalancerClass = config.require('loadBalancerClass');
