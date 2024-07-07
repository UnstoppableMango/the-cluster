import { ComponentResource, ComponentResourceOptions, CustomResourceOptions, Input, Output, output, Resource } from '@pulumi/pulumi';
import { remote as inputs } from '@pulumi/command/types/input';

type HasConnection = object & { connection: Input<inputs.ConnectionArgs> };
type RunArgs<T extends HasConnection> = Omit<T, 'connection'>;
type AnyOpts = CustomResourceOptions | ComponentResourceOptions;
type RunOpts<T extends AnyOpts> = Omit<T, 'parent'>;

type RemoteResource<T, V extends HasConnection> = {
  new(name: string, args: V, opts?: AnyOpts): T;
};

export interface CommandComponentArgs {
  connection: Input<inputs.ConnectionArgs>;
}

export abstract class CommandComponent extends ComponentResource {
  private readonly connection: Output<inputs.ConnectionArgs>;

  constructor(type: string, name: string, args: CommandComponentArgs, opts?: ComponentResourceOptions) {
    super(type, name, args, opts);
    this.connection = output(args.connection);
  }

  protected exec<T extends Resource, V extends HasConnection, U extends AnyOpts>(
    ctor: RemoteResource<T, V>,
    name: string,
    args: RunArgs<V>,
    opts?: RunOpts<U>,
  ): T {
    const withConnection: V = Object.create({ ...args, connection: this.connection });
    return new ctor(name, withConnection, { ...opts, parent: this });
  }
}
