import { StackReference } from '@pulumi/pulumi';
import { Lazy } from './util';

export function ref(project: string, cluster: string): StackReference {
	return new StackReference(`${project}-${cluster}`, {
		name: `UnstoppableMango/thecluster-${project}/${cluster}`,
	});
}

export function lazyRef(project: string, cluster: string): Lazy<StackReference> {
	return new Lazy(() => ref(project, cluster));
}
