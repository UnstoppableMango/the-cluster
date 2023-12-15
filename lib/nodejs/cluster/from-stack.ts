import { getStack } from '@pulumi/pulumi';
import { System } from '../internal';

const name = getStack();
export const system = new System(name);
export const kubeconfig = system.kubeconfig;
export const provider = system.provider;
export const refs = system.refs;
export const apps = system.apps;
export const bundles = system.bundles;
export const clusterIssuers = system.clusterIssuers;
export const databases = system.databases;
export const dns = system.dns;
export const identities = system.identities;
export const ingresses = system.ingresses;
export const issuers = system.issuers;
export const loadBalancers = system.loadBalancers;
export const realms = system.realms;
export const storageClasses = system.storageClasses;
