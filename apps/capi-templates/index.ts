import ns from './namespace';
import * as mt from './machineTemplates';
import * as sc from './serverClasses';
import * as px from './proxmox';

export * from './environments';
const namespace = ns;
export const rpi4MdTemplate = mt.rpi4Md;
export const ryzenGen1MdTemplate = mt.ryzenGen1Md;
export const pxZeusMdTemplate = mt.pxZeusMd;
export const pxApolloMdTemplate = mt.pxApolloMd;
export const rpi4MdServerClass = sc.rpi4Md;
export const ryzenGen1MdServerClass = sc.ryzenGen1Md;
const proxmoxConfigMapId = px.configMap.id;
const proxmoxSecretId = px.secret.id;
