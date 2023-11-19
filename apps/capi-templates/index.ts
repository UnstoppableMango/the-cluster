import ns from './namespace';
import * as mt from './machineTemplates';
import * as sc from './serverClasses';
import * as px from './proxmox';
import { MachineTemplatesOutput, ProxmoxOutput, ServerClassesOutput } from './types';

const namespace = ns;
export * from './environments';

export const serverClasses: ServerClassesOutput = {
  'rpi4.md.id': { id: sc.rpi4Md.id },
  'ryzen.gen1.md.id': { id: sc.ryzenGen1Md.id },
}

export const machineTemplates: MachineTemplatesOutput = {
  'rpi4.md': { id: mt.rpi4Md.id },
  'ryzen.gen1.md': { id: mt.ryzenGen1Md.id },
  'px.zeus.md': { id: mt.pxZeusMd.id },
  'px.apollo.md': { id: mt.pxApolloMd.id },
}

export const proxmox: ProxmoxOutput = {
  configMap: { id: px.configMap.id },
  secret: { id: px.secret.id },
}
