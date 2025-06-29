import { Config, getStack } from '@pulumi/pulumi';

export interface Cloudflare {
  apiToken: string;
  globalApiKey: string;
}

const config = new Config();
export const cloudflare = config.requireObject<Cloudflare>('cloudflare');
