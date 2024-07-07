import { ComponentResourceOptions, Output, Resource } from '@pulumi/pulumi';
import { PrivateKey } from '@pulumi/tls';
import { ControlPlaneNode, Node, NodeArgs, WorkerNode } from './components';
import { hosts, hostKeys, type Node as NodeConfig } from './config';

type NewNode<T extends Node> = {
  new(name: string, args: NodeArgs, opts?: ComponentResourceOptions): T;
}

type CreateNode<T extends Node> = {
  (config: NodeConfig, key: Output<PrivateKey>, dependsOn?: Resource[]): T;
}

function provision<T extends Node>(ctor: NewNode<T>): CreateNode<T> {
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

export const zeus = toExport(nodes.zeus);
export const gaea = toExport(nodes.gaea);
export const pik8s4 = toExport(nodes.pik8s4);
export const pik8s5 = toExport(nodes.pik8s5);
export const pik8s6 = toExport(nodes.pik8s6);
export const pik8s8 = toExport(nodes.pik8s8);
export const vrk8s1 = toExport(nodes.vrk8s1);

export const hostnames = Object.values(nodes)
  .map(x => x.config.hostname);

function toExport(node: Node): Record<string, any> {
  const { config } = node;
  const result: Record<string, any> = {
    hostname: config.hostname,
    ip: config.ip,
    clusterIp: config.clusterIp,
    arch: config.arch,
  };

  if (node instanceof ControlPlaneNode) {
    // TODO
  }
  if (node instanceof WorkerNode) {
    // TODO
  }

  return result;
}
