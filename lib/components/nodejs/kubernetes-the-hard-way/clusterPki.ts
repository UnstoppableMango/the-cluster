import * as path from 'node:path';
import { ComponentResource, ComponentResourceOptions, Input, Output, interpolate, output } from '@pulumi/pulumi';
import { remote } from '@pulumi/command/types/input';
import { RootCa } from './rootCa';
import { Certificate } from './certificate';
import { Algorithm } from './types';
import { RemoteFile } from './remoteFile';

export interface InstalledCerts {
  ca: RemoteFile;
  cert: RemoteFile;
  key: RemoteFile;
}

export interface NodeArgs {
  ip: Input<string>;
}

export type NodeMapInput = Record<string, Input<NodeArgs>>;

export interface ClusterPkiArgs<T extends NodeMapInput = NodeMapInput> {
  algorithm?: Input<Algorithm>;
  clusterName: Input<string>;
  expiry?: Input<number>;
  nodes: T;
  publicIp: Input<string>;
  size?: Input<number>;
}

type CertMap<T> = {
  [P in keyof T]: Certificate;
}

export class ClusterPki<T extends NodeMapInput = NodeMapInput> extends ComponentResource {
  public static readonly defaultAlgorithm: Algorithm = 'RSA';
  public static readonly defaultExpiry: number = 8760;
  public static readonly defaultSize: number = 2048;

  public readonly admin: Certificate;
  public readonly clusterName: Output<string>;
  public readonly controllerManager: Certificate;
  public readonly kubelet: CertMap<T>;
  public readonly kubeProxy: Certificate;
  public readonly kubernetes: Certificate;
  public readonly kubeScheduler: Certificate;
  public readonly publicIp: Output<string>;
  public readonly rootCa: RootCa;
  public readonly serviceAccounts: Certificate;

  constructor(private name: string, args: ClusterPkiArgs<T>, opts?: ComponentResourceOptions) {
    super('thecluster:index:clusterPki', name, args, opts);

    const algorithm = output(args.algorithm ?? ClusterPki.defaultAlgorithm);
    const clusterName = output(args.clusterName);
    const expiry = output(args.expiry ?? ClusterPki.defaultExpiry);
    const publicIp = output(args.publicIp);
    const size = output(args.size ?? ClusterPki.defaultSize);

    const rootCa = new RootCa(name, {
      algorithm, size, expiry,
      commonName: clusterName,
      allowedUses: [
        'cert_signing',
        'key_encipherment',
        'server_auth',
        'client_auth',
      ],
    }, { parent: this });

    const admin = rootCa.newCertificate(this.certName('admin'), {
      algorithm, size, expiry,
      commonName: 'admin',
      organization: 'system:masters',
      allowedUses: rootCa.allowedUses, // TODO
    }, { parent: this });

    const controllerManager = rootCa.newCertificate(this.certName('controller-manager'), {
      algorithm, size, expiry,
      commonName: 'system:kube-controller-manager',
      organization: 'system:kube-controller-manager',
      allowedUses: rootCa.allowedUses, // TODO
    }, { parent: this });

    const kubelet: Partial<CertMap<T>> = {};
    for (const key in args.nodes) {
      const node = output(args.nodes[key]);
      const certName = this.certName(`${key}-worker`);
      kubelet[key] = rootCa.newCertificate(certName, {
        algorithm, size, expiry,
        commonName: interpolate`system:node:${node.ip}`,
        organization: 'system:nodes',
        allowedUses: rootCa.allowedUses, // TODO
        ipAddresses: [node.ip],
      }, { parent: this });
    }

    const kubeProxy = rootCa.newCertificate(this.certName('kube-proxy'), {
      algorithm, size, expiry,
      commonName: 'system:kube-proxy',
      organization: 'system:node-proxier',
      allowedUses: rootCa.allowedUses, // TODO
    }, { parent: this });

    const kubeScheduler = rootCa.newCertificate(this.certName('kube-scheduler'), {
      algorithm, size, expiry,
      commonName: 'system:kube-scheduler',
      organization: 'system:kube-scheduler',
      allowedUses: rootCa.allowedUses, // TODO
    }, { parent: this });

    const kubernetes = rootCa.newCertificate(this.certName('kubernetes'), {
      algorithm, size, expiry,
      commonName: 'kubernetes',
      organization: 'Kubernetes',
      allowedUses: rootCa.allowedUses, // TODO
      dnsNames: [
        'kubernetes',
        'kubernetes.default',
        'kubernetes.default.svc',
        'kubernetes.default.svc.cluster',
        'kubernetes.svc.cluster.local',
      ],
      ipAddresses: [
        // Internal cluster service IPs
        '10.32.0.1', '10.240.0.10', '10.240.0.11', '10.240.0.12', '127.0.0.1',
        // TODO: Input IPs
        ...Object.values(args.nodes).map(x => output(x).ip),
        publicIp,
      ],
    }, { parent: this });

    const serviceAccounts = rootCa.newCertificate(this.certName('service-accounts'), {
      algorithm, size, expiry,
      commonName: 'service-accounts',
      organization: 'Kubernetes',
      allowedUses: rootCa.allowedUses, // TODO
    }, { parent: this });

    this.admin = admin;
    this.controllerManager = controllerManager;
    this.clusterName = clusterName;
    this.kubelet = kubelet as CertMap<T>; // TODO: Can we refactor away from a cast?
    this.kubeProxy = kubeProxy;
    this.kubeScheduler = kubeScheduler;
    this.kubernetes = kubernetes;
    this.publicIp = publicIp;
    this.rootCa = rootCa;
    this.serviceAccounts = serviceAccounts;

    this.registerOutputs({
      admin, controllerManager, kubeProxy, kubeScheduler,
      kubernetes, publicIp, rootCa, serviceAccounts,
    });
  }

  // TODO: Install path
  public installOn(node: keyof T, connection: remote.ConnectionArgs, opts?: ComponentResourceOptions): InstalledCerts {
    const target = path.join('home', 'kthw');
    const cert: Certificate = this.kubelet[node];

    const caPath = path.join(target, 'ca.pem');
    const certPath = path.join(target, 'cert.pem');
    const keyPath = path.join(target, 'key.pem');

    return {
      ca: this.rootCa.installCert(this.name, { connection, path: caPath }, opts),
      cert: cert.installCert(this.name, { connection, path: certPath }, opts),
      key: cert.installKey(this.name, { connection, path: keyPath }, opts),
    }
  }

  // TODO: Install controller certs

  private certName(type: string): string {
    return `${this.name}-${type}`;
  }
}
