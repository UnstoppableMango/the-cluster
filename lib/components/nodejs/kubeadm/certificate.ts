import { ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { CertRequest, LocallySignedCert } from '@pulumi/tls';
import { KeyPair, KeyPairArgs } from './keypair';

export interface CertificateArgs extends KeyPairArgs {
  isCaCertificate?: Input<boolean>;
  caCertPem: Input<string>;
  caPrivateKeyPem: Input<string>;
}

export class Certificate extends KeyPair<LocallySignedCert> {
  public readonly cert: LocallySignedCert;
  public readonly csr: CertRequest;

  constructor(name: string, args: CertificateArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:certificate', name, args, opts);

    const csr = new CertRequest(name, {
      privateKeyPem: this.key.privateKeyPem,
      subject: {
        commonName: args.commonName,
        country: args.country,
        organization: args.organization,
        organizationalUnit: args.organizationalUnit,
        province: args.state, // Eh
      },
    }, { parent: this });

    const cert = new LocallySignedCert(name, {
      isCaCertificate: args.isCaCertificate,
      allowedUses: args.allowedUses,
      validityPeriodHours: args.expiry,
      caCertPem: args.caCertPem,
      caPrivateKeyPem: args.caPrivateKeyPem,
      certRequestPem: csr.certRequestPem,
    }, { parent: this });

    this.cert = cert;
    this.csr = csr;

    this.registerOutputs({ cert, csr });
  }
}
