import { Config } from '@pulumi/pulumi';
import { System } from '../internal';

export const name = new Config().require('managementCluster');
export const system = new System(name);
export const kubeconfig = system.kubeconfig;
export const provider = system.provider;
export const refs = system.refs;
export const apps = system.apps;
export const clusterIssuers = system.clusterIssuers;
export const databases = system.databases;
export const dns = system.dns;
export const identities = system.identities;
export const ingresses = system.ingresses;
export const loadBalancers = system.loadBalancers;
export const realms = system.realms;
export const storageClasses = system.storageClasses;