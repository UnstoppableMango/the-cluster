import { Config } from '@pulumi/pulumi';

export interface Versions {
  nginxIngress: string;
}

const config = new Config();

export default config.requireObject<Versions>('versions');
