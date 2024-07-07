import { ComponentResourceOptions, Output, Resource } from '@pulumi/pulumi';
import { PrivateKey } from '@pulumi/tls';
import { ControlPlaneNode, NodeArgs, WorkerNode } from './components';
import { hosts, hostKeys, type Node as NodeConfig } from './config';

type NewNode<T> = {
  new(name: string, args: NodeArgs, opts?: ComponentResourceOptions): T;
}

function provision<T>(ctor: NewNode<T>): (config: NodeConfig, key: Output<PrivateKey>, dependsOn?: Resource[]) => T {
  return (config, key, dependsOn = []) => new ctor(config.hostname, {
    config,
    connection: {
      host: config.ip,
      privateKey: key.privateKeyOpenssh,
    },
  }, { dependsOn });
}

const provisionCtrl = provision(ControlPlaneNode);
const provisionWork = provision(WorkerNode);

const controlPlanes = {
  pik8s4: provisionCtrl(hosts.pik8s4, hostKeys.pik8s4),
  pik8s5: provisionCtrl(hosts.pik8s5, hostKeys.pik8s5),
  pik8s6: provisionCtrl(hosts.pik8s6, hostKeys.pik8s6),
};

// const allControlPlanes = Object.values(controlPlanes);
const allControlPlanes: ControlPlaneNode[] = []; // For testing

const workers = {
  zeus: provisionWork(hosts.zeus, hostKeys.zeus, allControlPlanes),
  // apollo: provisionWork(hosts.apollo, hostKeys.apollo, allControlPlanes),
  gaea: provisionWork(hosts.gaea, hostKeys.gaea, allControlPlanes),
  pik8s8: provisionWork(hosts.pik8s8, hostKeys.pik8s8, allControlPlanes),
  vrk8s1: provisionWork(hosts.vrk8s1, hostKeys.vrk8s1, allControlPlanes),
};

const nodes = { ...controlPlanes, ...workers };

export const zeus = nodes.zeus;
export const gaea = nodes.gaea;
export const pik8s4 = nodes.pik8s4;
export const pik8s5 = nodes.pik8s5;
export const pik8s6 = nodes.pik8s6;
export const pik8s8 = nodes.pik8s8;
export const vrk8s1 = nodes.vrk8s1;

export const hostnames = Object.values(nodes)
  .map(x => x.config.hostname);
