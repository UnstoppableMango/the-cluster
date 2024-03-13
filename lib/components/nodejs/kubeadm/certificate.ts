import { ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { CertRequest, LocallySignedCert } from '@pulumi/tls';
import { KeyPair, KeyPairArgs } from './keypair';
import { RemoteFile, RemoteFileArgs } from './remoteFile';

export interface CertificateArgs extends KeyPairArgs {
  dnsNames?: Input<Input<string>[]>;
  caCertPem: Input<string>;
  caPrivateKeyPem: Input<string>;
  ipAddresses?: Input<Input<string>[]>;
  isCaCertificate?: Input<boolean>;
  uris?: Input<Input<string>[]>;
}

export class Certificate extends KeyPair<LocallySignedCert> {
  public readonly cert: LocallySignedCert;
  public readonly csr: CertRequest;

  constructor(name: string, args: CertificateArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:certificate', name, args, opts);

    const csr = new CertRequest(name, {
      privateKeyPem: this.key.privateKeyPem,
      ipAddresses: args.ipAddresses,
      dnsNames: args.dnsNames,
      uris: args.uris,
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

  public installOn(
    name: string,
    args: Omit<RemoteFileArgs, 'content'>,
    opts?: ComponentResourceOptions,
  ): RemoteFile {
    return new RemoteFile(name, {
      ...args,
      content: this.cert.certPem,
    }, opts);
  }
}
