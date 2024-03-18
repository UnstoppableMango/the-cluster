import { ComponentResource, ComponentResourceOptions, Input, Output, output } from '@pulumi/pulumi';
import { LocallySignedCert, PrivateKey, SelfSignedCert } from '@pulumi/tls';
import { remote } from '@pulumi/command/types/input';
import { InstallArgs, RemoteFile } from './remoteFile';
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

  public get certPem(): Output<string> {
    return this.cert.certPem;
  }

  public get keyPem(): Output<string> {
    return this.key.publicKeyPem;
  }

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

  public installCert(name: string, args: InstallArgs, opts?: ComponentResourceOptions): RemoteFile {
    return installCert(this, name, args, opts);
  }

  public installKey(name: string, args: InstallArgs, opts?: ComponentResourceOptions): RemoteFile {
    return installKey(this, name, args, opts);
  }
}

export function installCert<T extends CertType>(
  pair: KeyPair<T>,
  name: string,
  args: InstallArgs,
  opts?: ComponentResourceOptions
): RemoteFile {
  return install(name, args.connection, pair.certPem, args.path, opts);
}

export function installKey<T extends CertType>(
  pair: KeyPair<T>,
  name: string,
  args: InstallArgs,
  opts?: ComponentResourceOptions
): RemoteFile {
  return install(name, args.connection, pair.keyPem, args.path, opts);
}

function install(
  name: string,
  connection: Input<remote.ConnectionArgs>,
  content: Input<string>,
  path: Input<string>,
  opts?: ComponentResourceOptions
): RemoteFile {
  return new RemoteFile(name, { connection, path, content }, opts);
}
