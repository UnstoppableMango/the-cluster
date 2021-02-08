import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { Namespace } from '@pulumi/rancher2';
import { RandomPassword } from '@pulumi/random';
import { getNameResolver } from '@unmango/shared/util';

export class Harbor extends ComponentResource {

  private readonly getName = getNameResolver('harbor', this.name);

  public readonly chartUrl = 'https://charts.bitnami.com/bitnami';
  public readonly namespace: Namespace;
  public readonly harborAdminPassword: RandomPassword;
  public readonly registryPassword: RandomPassword;
  public readonly postgresqlPassword: RandomPassword;
  public readonly chart: k8s.helm.v3.Chart;

  constructor(private name: string, args: HarborArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:harbor', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      name: 'harbor',
      projectId: args.projectId,
    }, { parent: this });

    // Only for first launch
    this.harborAdminPassword = new RandomPassword(this.getName('harbor-admin'), {
      length: 10,
    }, { parent: this });

    this.registryPassword = new RandomPassword(this.getName('registry'), {
      length: 24,
    }, { parent: this });

    this.postgresqlPassword = new RandomPassword(this.getName('postgresql'), {
      length: 24,
    }, { parent: this });

    this.chart = new k8s.helm.v3.Chart(this.getName(), {
      namespace: this.namespace.name,
      fetchOpts: { repo: this.chartUrl },
      chart: 'harbor',
      version: args.version,
      values: {
        harborAdminPassword: this.harborAdminPassword.result,
        service: {
          type: 'ClusterIP',
          tls: {
            // Let Traefik handle it
            enabled: false,
          },
        },
        ingress: {
          enabled: true,
          hosts: {
            core: 'harbor.int.unmango.net',
            notary: 'notary.int.unmango.net',
          },
        },
        persistence: {
          persistentVolumeClaime: {
            registry: {
              // storageClass: 'nfs-client',
              size: '100Gi',
              accessMode: 'ReadWriteMany',
            },
            jobservice: {
              accessMode: 'ReadWriteMany',
            },
            chartmuseum: {
              // storageClass: 'nfs-client',
              size: '25Gi',
              accessMode: 'ReadWriteMany',
            },
            trivy: {
              // storageClass: 'nfs-client',
              size: '25Gi',
            },
          },
        },
        registry: {
          credentials: {
            user: 'unstoppablemango',
            password: this.registryPassword.result,
          },
        },
        postgresql: {
          postgresqlPassword: this.postgresqlPassword.result,
        },
      },
    }, { parent: this });

    this.registerOutputs();
  }
}

export interface HarborArgs {
  projectId: Input<string>;
  version: Input<string>;
}
