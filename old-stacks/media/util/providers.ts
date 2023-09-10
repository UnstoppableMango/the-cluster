import * as pulumi from '@pulumi/pulumi';

export function resolveProvider<T extends pulumi.ProviderResource>(constructor: { new(...args: never[]): T; }): T | undefined {
  if (!this.opts) return;

  if (this.opts.provider instanceof constructor) {
    return this.opts.provider;
  }

  if (!this.opts.providers || !Array.isArray(this.opts.providers)) return;

  const viable = this.opts.providers.filter(x => x instanceof constructor);

  if (viable.length > 0) {
    return viable[0] as T;
  }

  return;
}
