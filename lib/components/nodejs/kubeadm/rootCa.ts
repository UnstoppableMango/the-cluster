import { ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { SelfSignedCert } from '@pulumi/tls';
import { KeyPair, KeyPairArgs } from './keypair';

export interface RootCaArgs extends KeyPairArgs { }

export class RootCa extends KeyPair<SelfSignedCert> {
  public readonly cert: SelfSignedCert;

  constructor(name: string, args: RootCaArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:rootCa', name, args, opts);

    const cert = new SelfSignedCert(name, {
      isCaCertificate: true,
      allowedUses: args.allowedUses,
      privateKeyPem: this.key.privateKeyPem,
      validityPeriodHours: args.expiry,
      subject: {
        commonName: args.commonName,
        country: args.country,
        organization: args.organization,
        organizationalUnit: args.organizationalUnit,
        province: args.state, // Eh
      },
    }, { parent: this });

    this.cert = cert;

    this.registerOutputs({ cert });
  }
}
