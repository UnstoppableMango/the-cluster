import { Config } from '@pulumi/pulumi';

export interface Versions {
	certManagerCsi: string;
	csiNodeDriverRegistrar: string;
	livenessProbe: string;
}

const config = new Config();
export const versions = config.requireObject<Versions>('versions');
export const driverName = 'csi.cert-manager.io';
