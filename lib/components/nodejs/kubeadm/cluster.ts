import { ComponentResource, ComponentResourceOptions, Input, Output, all, output } from '@pulumi/pulumi';
import { RootCa } from './rootCa';
import { Certificate } from './certificate';

export interface Node {
  hostname?: Input<string>;
  ip: Input<string>;
}

export interface ClusterArgs {
  clusterName: Input<string>;
  controlPlanes: Input<Input<Node>[]>;
  workers: Input<Input<Node>[]>;
}

function from<T>(x: T | undefined): T[] {
  return x ? [x] : [];
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

    const adminCert = new Certificate(`${name}-admin`, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'admin',
      organization: 'system:masters',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.allowedUses,
      expiry: 8670,
    }, { parent: this });

    const kubeletCerts = output(args.workers).apply(w => {
      return w.map((x, i) => new Certificate(`${name}-worker${i}`, {
        algorithm: 'RSA',
        size: 2048,
        commonName: `system:node:${x.ip}`,
        organization: 'system:nodes',
        caCertPem: rootCa.cert.certPem,
        caPrivateKeyPem: rootCa.key.privateKeyPem,
        allowedUses: rootCa.allowedUses,
        expiry: 8670,
        ipAddresses: [x.ip],
        dnsNames: from(x.hostname),
      }, { parent: this }));
    });

    const controllerManagerCert = new Certificate(`${name}-controller-manager`, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'system:kube-controller-manager',
      organization: 'system:kube-controller-manager',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.allowedUses,
      expiry: 8670,
    }, { parent: this });

    const kubeProxyCert = new Certificate(`${name}-kube-proxy`, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'system:kube-proxy',
      organization: 'system:node-proxier',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.allowedUses,
      expiry: 8670,
    }, { parent: this });

    const kubeSchedulerCert = new Certificate(`${name}-kube-shceduler`, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'system:kube-scheduler',
      organization: 'system:kube-scheduler',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.allowedUses,
      expiry: 8670,
    }, { parent: this });

    const kubernetesCert = new Certificate(`${name}-kubernetes`, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'kubernetes',
      organization: 'Kubernetes',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.allowedUses,
      expiry: 8670,
      dnsNames: [
        'kubernetes',
        'kubernetes.default',
        'kubernetes.default.svc',
        'kubernetes.default.svc.cluster',
        'kubernetes.svc.cluster.local',
      ],
      ipAddresses: [
        // Internal cluster service IPs
        '10.32.0.1', '10.240.0.10', '10.240.0.11', '10.240.0.12',
        '127.0.0.1',
        // TODO: Input IPs
      ],
    }, { parent: this });

    const serviceAccountCert = new Certificate(`${name}-service-account`, {
      algorithm: 'RSA',
      size: 2048,
      commonName: 'service-accounts',
      organization: 'Kubernetes',
      caCertPem: rootCa.cert.certPem,
      caPrivateKeyPem: rootCa.key.privateKeyPem,
      allowedUses: rootCa.allowedUses,
      expiry: 8670,
    }, { parent: this });

    this.adminCert = adminCert;
    this.clusterName = clusterName;
    this.rootCa = rootCa;

    this.registerOutputs({ adminCert, clusterName, rootCa });
  }
}
