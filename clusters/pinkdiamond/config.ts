import { Config, StackReference, getStack } from '@pulumi/pulumi';
import { z } from 'zod';

const Versions = z.object({
  containerd: z.string(),
  k8s: z.string(),
  talos: z.string(),
  ksca: z.string(),
  runc: z.string(),
  crictl: z.string(),
  cniPlugins: z.string(),
});

export type Versions = z.infer<typeof Versions>;

const Vlan = z.object({
  tag: z.number(),
  name: z.string(),
  interface: z.string(),
});

export type Vlan = z.infer<typeof Vlan>;

const AnyPrimitive = z.union([
  z.string(),
  z.boolean(),
  z.number(),
]);

const Node = z.object({
  hostname: z.string(),
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
});

export type Node = z.infer<typeof Node>;

export const config = new Config();
export const stack = getStack();

const getNodes: (key: string) => Node[] = (key) => {
  const value = config.requireObject(key);
  return z.array(Node).parse(value);
}

export const controlplanes: Node[] = getNodes('controlplanes');
export const workers: Node[] = getNodes('workers');
export const versions: Versions = Versions.parse(config.requireObject('versions'));

const TheClusterTls = z.object({
  privateKeyPem: z.string(),
  certPem: z.string(),
});

const caRef = new StackReference('ca', {
  name: `UnstoppableMango/tls/prod`,
});

const thecluster = caRef.requireOutput('thecluster').apply(TheClusterTls.parse);
export const caPrivateKeyPem = thecluster.privateKeyPem;
export const caCertPem = thecluster.certPem;
