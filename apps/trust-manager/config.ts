import { Config, getStack, output } from '@pulumi/pulumi';

const config = new Config();
export const suffix = config.get('suffix');
export const cluster = getStack();
