import { Config, getStack, StackReference } from '@pulumi/pulumi';
import { z } from 'zod';

const Versions = z.object({
	k8s: z.string(),
	ksca: z.string(),
});

export type Versions = z.infer<typeof Versions>;

export const config = new Config();
export const stack = getStack();

export const versions: Versions = Versions.parse(config.requireObject('versions'));

const TheClusterTls = z.object({
	privateKeyPem: z.string(),
	certPem: z.string(),
});

const pik8s4Ref = new StackReference('pik8s4', {
	name: `UnstoppableMango/hosts/pik8s4`,
});

export const kubeconfig = pik8s4Ref.requireOutput('kubeconfig').apply(String);
