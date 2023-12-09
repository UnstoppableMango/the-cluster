import { Config } from '@pulumi/pulumi';

export interface Keepers {
  pgadmin: string;
}

const config = new Config();
export const keepers = config.requireObject<Keepers>('keepers');
