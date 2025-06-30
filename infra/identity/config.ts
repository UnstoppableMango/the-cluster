import { Config, getStack } from '@pulumi/pulumi';

export interface Idp {
	clientId: string;
	clientSecret: string;
}

export interface MicrosoftIdp extends Idp {
	tenantId: string;
}

export interface StackExchangeIdp extends Idp {
	key: string;
}

export interface Me {
	firstName: string;
	lastName: string;
	email: string;
}

const config = new Config();
export const cluster = getStack();
export const github = config.requireObject<Idp>('github');
export const google = config.requireObject<Idp>('google');
export const microsoft = config.requireObject<MicrosoftIdp>('microsoft');
export const stackExchange = config.requireObject<StackExchangeIdp>('stackExchange');
export const twitter = config.requireObject<Idp>('twitter');
export const me = config.requireObject<Me>('me');
