import { Provider } from '@pulumi/kubernetes';
import { Output, StackReference } from '@pulumi/pulumi';

export function ref(cluster: string, stack?: string): StackReference {
	return new StackReference(cluster, {
		name: `UnstoppableMango/thecluster-${cluster}/${stack ?? 'prod'}`,
	});
}

export function kubeconfig(ref: StackReference): Output<string> {
	return ref.requireOutput('kubeconfig') as Output<string>;
}

export function provider(ref: StackReference, cluster: string): Provider {
	return new Provider(cluster, { kubeconfig: kubeconfig(ref) });
}
