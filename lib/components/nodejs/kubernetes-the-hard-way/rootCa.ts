import { ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { SelfSignedCert } from '@pulumi/tls';
import { KeyPair, KeyPairArgs } from './keypair';
import { Certificate, CertificateArgs } from './certificate';

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

  public newCertificate(
    name: string,
    args: Omit<CertificateArgs, 'caCertPem' | 'caPrivateKeyPem'>,
    opts?: ComponentResourceOptions,
  ): Certificate {
    return new Certificate(name, {
      ...args,
      caCertPem: this.cert.certPem,
      caPrivateKeyPem: this.key.privateKeyPem,
    }, opts);
  }

  public newAdminCertificate(
    name: string,
    args: Omit<
      CertificateArgs,
      'caCertPem' | 'caPrivateKeyPem' | 'commonName' | 'organization'
    >,
    opts?: ComponentResourceOptions,
  ): Certificate {
    return this.newCertificate(`${name}-admin`, {
      ...args,
      commonName: 'admin',
      organization: 'system:masters',
    }, opts);
  }

  public newKubeletCertificate(
    name: string,
    index: number,
    ip: string,
    args: Omit<
      CertificateArgs,
      'caCertPem' | 'caPrivateKeyPem' | 'commonName' | 'organization'
    >,
    opts?: ComponentResourceOptions,
  ): Certificate {
    return this.newCertificate(`${name}-node${index}`, {
      ...args,
      commonName: `system:node:${ip}`,
      organization: 'system:nodes',
    }, opts);
  }
}
