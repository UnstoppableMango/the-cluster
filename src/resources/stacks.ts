import { ComponentResource, ComponentResourceOptions, Config } from '@pulumi/pulumi';
import { Secret } from '@pulumi/kubernetes/core/v1';
import * as base64 from '../external/base64';

export class OperatorStacks extends ComponentResource {

  private readonly _opts = {
    provider: this.opts?.provider,
    parent: this,
  };

  private readonly _config = new Config();

  private readonly _accessToken = new Secret('access-token', {
    data: { accessToken: this._config.requireSecret('pulumiAccessToken').apply(base64.encode) },
  }, this._opts);

  constructor(name: string, private opts?: ComponentResourceOptions) {
    super('unmango:pulumi:stacks', name, undefined, opts);
  }

}
