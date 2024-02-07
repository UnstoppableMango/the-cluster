import { System } from '../internal';

export const system = new System('rosequartz');
export const kubeconfig = system.kubeconfig;
export const provider = system.provider;
export const refs = system.refs;
export const apps = system.apps;
// export const clusterIssuers = system.clusterIssuers;
export const dns = system.dns;
export const ingresses = system.ingresses;
// export const issuers = system.issuers;
// export const loadBalancers = system.loadBalancers;
// export const realms = system.realms;
export const versions = system.versions;
