import * as YAML from 'yaml';
import { pipe } from 'fp-ts/lib/function';
import * as Arr from 'fp-ts/Array';
import { asset, ComponentResource, ComponentResourceOptions, CustomResourceOptions, interpolate } from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { remote, types } from '@pulumi/command';
import { Chmod, Mkdir, Tee, Wget } from '@unmango/pulumi-commandx/remote';
import { CniPluginsInstall, ContainerdInstall, CrictlInstall, RuncInstall } from '@unmango/pulumi-kubernetes-the-hard-way/remote';
import { Node, Vlan, controlplanes, versions, workers } from './config';

interface Provisioned {
  node: Node;
  key: tls.PrivateKey;
}

type NodeType = 'controlplane' | 'worker';
type Tagged<T> = [NodeType, T];

type CreateCommand = (
  name: string,
  args: Omit<remote.CommandArgs, 'connection'>,
  opts?: Omit<CustomResourceOptions, 'parent'>,
) => remote.Command;

type CheckPort = (
  ip: string,
  port: number,
  opts?: Omit<CustomResourceOptions, 'parent'>,
) => remote.Command;

interface ClusterNodeArgs extends Provisioned {
}

class ClusterNode extends ComponentResource implements Provisioned {
  public node: Node;
  public key: tls.PrivateKey;
  public connection: types.input.remote.ConnectionArgs;
  public run: CreateCommand;

  constructor(name: string, args: ClusterNodeArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:index:ClusterNode/${name}`, name, args, opts);

    const { node, key } = args;

    this.node = node;
    this.key = key;

    this.connection = {
      host: node.ip,
      privateKey: key.privateKeyOpenssh,
    };

    this.run = (name, args, opts) => new remote.Command(name, {
      connection: this.connection,
      ...args,
    }, { parent: this, ...opts });

    this.registerOutputs({
      node: this.node,
      key: this.key,
    });
  }

  public configurePort(ip: string, port: number): void {
    const key = `${ip}-${port}`;

    const config = this.run(`ufw-${key}`, {
      create: `ufw allow ${port}`,
      delete: `ufw deny ${port}`,
    });
  }

  public configureControlPlanePorts(): void {
    // TODO: Not all of these are needed on both localhost and clusterIp
    // https://kubernetes.io/docs/reference/networking/ports-and-protocols/#control-plane
    ['127.0.0.1', this.node.clusterIp].map(ip => {
      this.configurePort(ip, 6443); // Kubernetes API server
      this.configurePort(ip, 2379); // etcd server client API
      this.configurePort(ip, 2380); // etcd server client API
      this.configurePort(ip, 10250); // Kubelet API
      this.configurePort(ip, 10259); // kube-scheduler
      this.configurePort(ip, 10257); // kube-controller-manager
    });
  }

  public configureWorkerPorts(): void {
    // https://kubernetes.io/docs/reference/networking/ports-and-protocols/#node
    ['127.0.0.1', this.node.clusterIp].map(ip => {
      this.configurePort(ip, 10250); // Kubelet API
      this.configurePort(ip, 10256); // kube-proxy
    });
  }

  public configureVlan(vlan: Vlan, node: Node): void {
    const file = '/etc/netplan/69-thecluster-vlan.yaml';

    const remove = this.run('remove-vlan', {
      delete: 'netplan apply',
    });

    const config = new Tee('vlan', {
      connection: this.connection,
      stdin: YAML.stringify({
        network: {
          vlans: {
            [vlan.name]: {
              id: vlan.tag,
              link: vlan.interface,
              addresses: [
                `${node.clusterIp}/16`,
              ],
            },
          },
        },
      }),
      create: {
        files: [file],
      },
      delete: `rm ${file}`,
    }, { parent: this, dependsOn: remove });

    const chmod = new Chmod('vlan-chmod', {
      connection: this.connection,
      create: {
        files: [file],
        mode: '600',
      },
    }, { parent: this, dependsOn: config });

    this.run('apply-vlan', {
      create: 'netplan apply',
    }, { dependsOn: [config, chmod] });
  }

  public enableIpv4PacketForwarding(): void {
    const deleteSysctl = this.run(`remove-ipv4-forwarding`, {
      delete: 'sysctl --system',
    });

    const file = `/etc/sysctl.d/k8s.conf`;
    const tee = new Tee('ipv4-forwarding', {
      connection: this.connection,
      stdin: `net.ipv4.ip_forward = 1\n`,
      create: {
        files: [file],
      },
      delete: `rm ${file}`,
    }, { parent: this, dependsOn: deleteSysctl });

    this.run('apply-ipv4-forwarding', {
      create: 'sysctl --system',
    }, { dependsOn: tee });
  }

  public installWorkerTools(): void {
    const containerdInstall = new ContainerdInstall('containerd', {
      connection: this.connection,
      architecture: this.node.arch,
      version: versions.containerd,
    }, { parent: this });

    const containerdSystemd = new Wget('containerd-systemd', {
      connection: this.connection,
      create: {
        url: [interpolate`https://raw.githubusercontent.com/containerd/containerd/v${versions.containerd}/containerd.service`],
        directoryPrefix: '/usr/local/lib/systemd/system',
      },
      delete: `rm '/usr/local/lib/systemd/system/containerd.service'`,
    }, { parent: this });

    new remote.Command('containerd-start', {
      connection: this.connection,
      create: 'systemctl daemon-reload && systemctl enable --now containerd',
      delete: 'systemctl disable --now containerd',
    }, { parent: this, dependsOn: [containerdInstall, containerdSystemd] });

    const etcContainerdMkdir = new Mkdir('etc-containerd', {
      connection: this.connection,
      create: {
        directory: '/etc/containerd',
      },
    }, { parent: this });

    const containerdConfig = new remote.CopyToRemote('containerd-config', {
      connection: this.connection,
      source: new asset.FileAsset('./containerd/config.toml'),
      remotePath: '/etc/containerd/config.toml',
    }, { parent: this, dependsOn: etcContainerdMkdir });

    new RuncInstall('runc', {
      connection: this.connection,
      architecture: this.node.arch,
      version: versions.runc,
    }, { parent: this });

    new CrictlInstall('crictl', {
      connection: this.connection,
      architecture: this.node.arch,
      version: versions.crictl,
    }, { parent: this });

    new CniPluginsInstall('cni', {
      connection: this.connection,
      architecture: this.node.arch,
      version: versions.cniPlugins,
    }, { parent: this });
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
  if (node.node.vlan) {
    const vlan = node.node.vlan;
    node.configureVlan(vlan, node.node);
  }

  switch (type) {
    case 'controlplane':
      node.configureControlPlanePorts();
      break;
    case 'worker':
      node.configureWorkerPorts();
      node.enableIpv4PacketForwarding();
      node.installWorkerTools();
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
