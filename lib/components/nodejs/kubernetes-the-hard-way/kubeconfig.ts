import * as path from 'node:path';
import * as YAML from 'yaml';
import { ComponentResourceOptions, Input, Output, interpolate, output } from '@pulumi/pulumi';
import { remote } from '@pulumi/command/types/input';
import { ClusterPki, NodeMapInput } from './clusterPki';
import { Certificate } from './certificate';
import { RemoteFile } from './remoteFile';

export interface Kubeconfig {
  clusters: {
    cluster: {
      certificateAuthorityData: Output<string>;
      server: Output<string>;
    },
    name: Output<string>;
  }[];
  contexts: {
    context: {
      cluster: Output<string>;
      user: Output<string>;
    };
    name: Output<string>;
  }[];
  users: {
    name: Output<string>;
    user: {
      clientCertificateData: Output<string>;
      clientKeyData: Output<string>;
    };
  }[];
}

const localhost = '127.0.0.1';

export function getWorkerKubeconfig<T extends NodeMapInput = NodeMapInput>(node: keyof T, pki: ClusterPki<T>): Kubeconfig {
  return getKubeconfig(pki, `system:node:${String(node)}`, pki.publicIp, pki.kubelet[node]);
}

export function getKubeProxyKubeconfig(pki: ClusterPki): Kubeconfig {
  return getKubeconfig(pki, 'system:kube-proxy', pki.publicIp, pki.kubeProxy);
}

export function getKubeControllerManagerKubeconfig(pki: ClusterPki): Kubeconfig {
  return getKubeconfig(pki, 'system:kube-controller-manager', localhost, pki.controllerManager);
}

export function getKubeSchedulerKubeconfig(pki: ClusterPki): Kubeconfig {
  return getKubeconfig(pki, 'system:kube-scheduler', localhost, pki.kubeScheduler);
}

export function getAdminKubeconfig(pki: ClusterPki): Kubeconfig {
  return getKubeconfig(pki, 'admin', localhost, pki.admin);
}

export function installOn(
  config: Kubeconfig,
  name: string,
  connection: remote.ConnectionArgs,
  opts?: ComponentResourceOptions
): RemoteFile {
  const target = path.join('home', 'kthw');
  return new RemoteFile(name, {
    connection,
    content: output(config).apply(x => YAML.stringify(x)),
    path: path.join(target, `${name}.kubeconfig`),
  }, opts);
}

// TODO: Install worker certs
// TODO: Install controlplane certs

function getKubeconfig(
  pki: ClusterPki,
  username: Input<string>,
  ip: Input<string>,
  cert: Certificate
): Kubeconfig {
  return {
    clusters: [{
      name: pki.clusterName,
      cluster: {
        certificateAuthorityData: pki.rootCa.cert.certPem,
        server: interpolate`https://${ip}:6443`,
      },
    }],
    contexts: [{
      name: output('default'),
      context: {
        cluster: pki.clusterName,
        user: output(username),
      },
    }],
    users: [{
      name: output(username),
      user: {
        clientCertificateData: cert.certPem,
        clientKeyData: cert.keyPem,
      },
    }],
  };
}
