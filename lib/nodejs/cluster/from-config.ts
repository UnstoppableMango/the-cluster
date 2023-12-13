import { Config } from '@pulumi/pulumi';
import { System } from '../internal';

const name = new Config().require('cluster');
export const system = new System(name);
export const kubeconfig = system.kubeconfig;
export const provider = system.provider;
export const appRefs = system.appRefs;
export const apps = system.apps;
export const ingresses = system.ingresses;
export const storageClasses = system.storageClasses;
export const databases = system.databases;
export const loadBalancers = system.loadBalancers;
