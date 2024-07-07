import { Config, getStack, Output, StackReference } from '@pulumi/pulumi';
import { PrivateKey } from '@pulumi/tls';
import { z } from 'zod';

const AnyPrimitive = z.union([
  z.string(),
  z.boolean(),
  z.number(),
]);

const HostKeys = z.object({
  zeus: z.instanceof(PrivateKey),
  // apollo: z.instanceof(PrivateKey),
  gaea: z.instanceof(PrivateKey),
  pik8s4: z.instanceof(PrivateKey),
  pik8s5: z.instanceof(PrivateKey),
  pik8s6: z.instanceof(PrivateKey),
  pik8s8: z.instanceof(PrivateKey),
  vrk8s1: z.instanceof(PrivateKey),
});

const Bond = z.object({
  name: z.string(),
  interfaces: z.array(z.string()),
  addresses: z.array(z.string()),
  mode: z.string(),
});

const Vlan = z.object({
  tag: z.number(),
  name: z.string(),
  interface: z.string(),
});

const Node = z.object({
  hostname: HostKeys.keyof(),
  arch: z.union([
    z.literal('amd64'),
    z.literal('arm64'),
  ]),
  ip: z.string(),
  clusterIp: z.string(),
  installDisk: z.string(),
  qemu: z.boolean().optional(),
  nodeLabels: z.record(AnyPrimitive).optional(),
  nodeTaints: z.record(AnyPrimitive).optional(),
  vlan: Vlan.optional(),
  bond: Bond.optional(),
});

const Hosts = z.object({
  zeus: Node,
  // apollo: Node,
  gaea: Node,
  pik8s4: Node,
  pik8s5: Node,
  pik8s6: Node,
  pik8s8: Node,
  vrk8s1: Node,
});

const Versions = z.object({
  containerd: z.string(),
  k8s: z.string(),
  talos: z.string(),
  ksca: z.string(),
  runc: z.string(),
  crictl: z.string(),
  cniPlugins: z.string(),
});

export type HostKeys = z.infer<typeof HostKeys>;
export type Hosts = z.infer<typeof Hosts>;
export type Node = z.infer<typeof Node>;
export type Versions = z.infer<typeof Versions>;
export type Vlan = z.infer<typeof Vlan>;
export type Bond = z.infer<typeof Bond>;

export const config = new Config();
export const stack = getStack();

const pkiRef = new StackReference('pki', {
  name: 'UnstoppableMango/pki/prod',
});

const requireZod = <T>(parser: z.ZodType<T>, key: string): T => {
  return parser.parse(config.requireObject(key));
}

export const hosts: Hosts = requireZod(Hosts, 'hosts');
export const versions: Versions = requireZod(Versions, 'versions');

export const hostKeys: Output<HostKeys> = pkiRef.requireOutput('hostKeys').apply(k => ({
  zeus: (k.zeus as PrivateKey),
  gaea: (k.gaea as PrivateKey),
  pik8s4: (k.pik8s4 as PrivateKey),
  pik8s5: (k.pik8s5 as PrivateKey),
  pik8s6: (k.pik8s6 as PrivateKey),
  pik8s8: (k.pik8s8 as PrivateKey),
  vrk8s1: (k.vrk8s1 as PrivateKey),
}));

export const Defaults = {
  systemdDirectory: '/usr/local/lib/systemd/system',
};
