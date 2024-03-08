import { ComponentResource, ComponentResourceOptions, Input, Output, output } from '@pulumi/pulumi';
import { RootCa } from './rootCa';
import { Certificate } from './certificate';

export interface ClusterArgs {
  clusterName: Input<string>;
}

export class Cluster extends ComponentResource {
  public readonly adminCert: Certificate;
  public readonly clusterName: Output<string>;
  public readonly rootCa: RootCa;

  constructor(name: string, args: ClusterArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:cluster', name, args, opts);

    const clusterName = output(args.clusterName);

    const rootCa = new RootCa(name, {
      algorithm: 'RSA',
      size: 2048,
      allowedUses: ['cert_signing', 'key_encipherment', 'server_auth', 'client_auth'],
      commonName: clusterName,
      expiry: 8760,
    }, { parent: this });

    const adminCert = new Certificate(name, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'admin',
      organization: 'system:masters',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.cert.allowedUses,
      expiry: 8670,
    }, { parent: this });

    this.clusterName = clusterName;
    this.rootCa = rootCa;

    this.registerOutputs({ clusterName, rootCa });
  }
}
