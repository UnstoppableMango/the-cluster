import { exec } from 'child_process';
import { ComponentResource, ComponentResourceOptions, Input, Output } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { AppV2, Namespace } from '@pulumi/rancher2';
import { RandomPassword } from '@pulumi/random';
import { getNameResolver } from '@unmango/shared/util';
import * as yaml from 'yaml';

export class Harbor extends ComponentResource {

  private readonly getName = getNameResolver('harbor', this.name);

  public readonly namespace: Namespace;
  public readonly harborAdminPassword: RandomPassword;
  public readonly postgresqlPassword: RandomPassword;
  public readonly app: AppV2;

  constructor(private name: string, args: HarborArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:harbor', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      name: 'harbor',
      projectId: args.projectId,
    }, { parent: this });

    // Only for first launch
    // ...or not? Docs are misleading
    this.harborAdminPassword = new RandomPassword(this.getName('harbor-admin'), {
      length: 10,
    }, { parent: this });

    this.postgresqlPassword = new RandomPassword(this.getName('postgresql'), {
      length: 24,
    }, { parent: this });

    this.app = new AppV2(this.getName(), {
      namespace: this.namespace.name,
      clusterId: args.clusterId,
      projectId: args.projectId,
      repoName: 'bitnami',
      chartName: 'harbor',
      chartVersion: args.version,
      values: pulumi.all([
        this.harborAdminPassword.result,
        this.postgresqlPassword.result,
        args.registryPassword,
        args.registryHtpasswd,
      ]).apply(([harborPass, postgresPass, registryPass, htpasswd]) => yaml.stringify({
        harborAdminPassword: harborPass,
        externalURL: 'https://harbor.int.unmango.net',
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
          persistentVolumeClaim: {
            registry: {
              storageClass: 'nfs-client',
              size: '100Gi',
              // accessMode: 'ReadWriteMany',
            },
            // jobservice: {
            //   accessMode: 'ReadWriteMany',
            // },
            chartmuseum: {
              storageClass: 'nfs-client',
              size: '25Gi',
              // accessMode: 'ReadWriteMany',
            },
            trivy: {
              size: '25Gi',
            },
          },
        },
        registry: {
          credentials: {
            username: 'unstoppablemango',
            password: registryPass,
            htpasswd: htpasswd,
          },
        },
        postgresql: {
          postgresqlPassword: postgresPass,
        },
        jobservice: {
          // So PVC doesn't get locked
          updateStrategy: { type: 'Recreate' },
        },
      })),
    }, { parent: this });

    this.registerOutputs();
  }

  private getHtpasswd(username: string, password: string): Output<string> {
    return pulumi.output(new Promise((resolve, reject) => {
      const result = exec(`htpasswd -nbBC10 '${username}' '${password}'`, (err, stdout, stderr) => {
        if (err || stderr) reject(err ?? stderr);
        resolve(stdout.trim());
      });
    }));
  }

}

export interface HarborArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
  version: Input<string>;
  registryPassword: Input<string>;
  registryHtpasswd: Input<string>;
}
