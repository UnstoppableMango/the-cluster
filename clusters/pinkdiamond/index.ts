import { pipe } from 'fp-ts/lib/function';
import * as Arr from 'fp-ts/Array';
import { ComponentResource, ComponentResourceOptions } from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { types } from '@pulumi/command';
import { Node, controlplanes, workers } from './config';

interface Provisioned {
  node: Node;
  key: tls.PrivateKey;
}

type NodeType = 'controlplane' | 'worker';
type Tagged<T> = [NodeType, T];

interface ClusterNodeArgs extends Provisioned {
}

class ClusterNode extends ComponentResource implements Provisioned {
  public node: Node;
  public key: tls.PrivateKey;
  public connection: types.input.remote.ConnectionArgs;

  constructor(name: string, args: ClusterNodeArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:index:ClusterNode/${name}`, name, args, opts);

    const { node, key } = args;

    this.node = node;
    this.key = key;

    this.connection = {
      host: node.ip,
      privateKey: key.privateKeyOpenssh,
    };

    this.registerOutputs({
      node: this.node,
      key: this.key,
    });
  }
}

type Exports = Record<string, ClusterNode>;

const Tagged = {
  tag(type: NodeType): (node: Node) => Tagged<Node> {
    return (node) => [type, node];
  },
  map<T, V>(f: (x: T) => V): (tagged: Tagged<T>) => Tagged<V> {
    return ([tag, x]) => [tag, f(x)];
  },
  tap<T>(f: (x: Tagged<T>) => void): (tagged: Tagged<T>) => Tagged<T> {
    return (tagged) => {
      f(tagged);
      return tagged;
    }
  },
  untag<T>(): (tagged: Tagged<T>) => T {
    return ([_, x]) => x;
  },
};

function toClusterNode(node: Node): ClusterNode {
  const key = new tls.PrivateKey(node.ip, {
    algorithm: 'ED25519',
  }, { protect: true });

  return new ClusterNode(
    node.hostname,
    { key, node },
  );
}

function provision([type, node]: Tagged<ClusterNode>): void {
  switch (type) {
    case 'controlplane':
      // node.configureControlPlanePorts();
      break;
    case 'worker':
      // node.configureWorkerPorts();
      // node.enableIpv4PacketForwarding();
      // node.installWorkerTools();
      break;
  }
}

function toExports(acc: Exports, node: ClusterNode): Exports {
  return { ...acc, [node.node.hostname]: node };
}

export const provisioned = pipe(
  [
    ...pipe(controlplanes, Arr.map(Tagged.tag('controlplane'))),
    ...pipe(workers, Arr.map(Tagged.tag('worker'))),
  ],
  Arr.map(Tagged.map(toClusterNode)),
  Arr.map(Tagged.tap(provision)),
  Arr.map(Tagged.untag<ClusterNode>()),
  Arr.reduce({}, toExports)
);
