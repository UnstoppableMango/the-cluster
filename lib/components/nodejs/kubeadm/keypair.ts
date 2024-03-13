import { ComponentResource, ComponentResourceOptions, Input, Output, output } from '@pulumi/pulumi';
import { LocallySignedCert, PrivateKey, SelfSignedCert } from '@pulumi/tls';
import { Algorithm, AllowedUsage, EcdsaCurve } from './types';

export interface KeyPairArgs {
  algorithm: Input<Algorithm>;
  allowedUses: Input<Input<AllowedUsage>[]>;
  ecdsaCurve?: Input<EcdsaCurve>;
  commonName: Input<string>;
  country?: Input<string>;
  expiry: Input<number>;
  location?: Input<string>;
  organization?: Input<string>;
  organizationalUnit?: Input<string>;
  size?: Input<number>;
  state?: Input<string>;
}

type CertType = SelfSignedCert | LocallySignedCert;

export abstract class KeyPair<TCert extends CertType> extends ComponentResource {
  public readonly allowedUses: Output<Output<AllowedUsage>[]>;
  public abstract readonly cert: TCert;
  public readonly key: PrivateKey;

  constructor(type: string, name: string, args: KeyPairArgs, opts?: ComponentResourceOptions) {
    super(type, name, args, opts);

    const key = new PrivateKey(name, {
      algorithm: args.algorithm,
      rsaBits: args.size,
      ecdsaCurve: args.ecdsaCurve,
    }, { parent: this });

    // TODO: Can this be cleaned up?
    this.allowedUses = output(args.allowedUses).apply(x => x.map(y => output(y)));
    this.key = key;

    this.registerOutputs({ key });
  }
}
