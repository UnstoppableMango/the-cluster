import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { Namespace } from '@pulumi/rancher2';
import { RandomPassword } from '@pulumi/random';
import { getNameResolver } from '@unmango/shared/util';

export class KeyCloak extends ComponentResource {

  private readonly getName = getNameResolver('keycloak', this.name);

  public readonly chartUrl = 'https://charts.bitnami.com/bitnami';
  public readonly namespace: Namespace;
  public readonly adminPassword: RandomPassword;
  public readonly managementPassword: RandomPassword;
  public readonly postgresPassword: RandomPassword;
  public readonly app: k8s.helm.v3.Chart;

  constructor(private name: string, args: KeyCloakArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:keycloak', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      projectId: args.projectId,
    }, { parent: this });

    this.adminPassword = new RandomPassword(this.getName('admin'), {
      length: 24,
    }, { parent: this });

    this.managementPassword = new RandomPassword(this.getName('management'), {
      length: 24,
    }, { parent: this });

    this.postgresPassword = new RandomPassword(this.getName('postgres'), {
      length: 24,
    }, { parent: this });

    this.app = new k8s.helm.v3.Chart(this.getName(), {
      namespace: this.namespace.name,
      fetchOpts: { repo: this.chartUrl },
      chart: 'keycloak',
      version: args.version,
      values: {
        replicaCount: 3,
        affinity: {
          podAntiAffinity: {
            requiredDuringSchedulingIgnoredDuringExecution: [{
              labelSelector: {
                matchLabels: {
                  'app.kubernetes.io/instance': 'keycloack',
                  'app.kubernetes.io/name': 'keycloack',
                },
              },
              namespaces: [this.namespace.name],
              topologyKey: 'host',
            }],
          },
        },
        auth: {
          adminUser: 'admin',
          adminPassword: this.adminPassword.result,
          // Setting manually so the chart doesn't generate a new value every time.
          managementPassword: this.managementPassword.result,
        },
        proxyAddressForwarding: true,
        serviceDiscovery: {
          enabled: true,
        },
        service: {
          type: 'ClusterIP',
        },
        ingress: {
          enabled: true,
          hostname: 'keycloak.int.unmango.net',
          extraHosts: [{
            name: 'keycloak.unmango.net',
          }],
        },
        postgresql: {
          // Setting manually so the chart doesn't generate a new value every time.
          postgresqlPassword: this.postgresPassword.result,
        },
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface KeyCloakArgs {
  projectId: Input<string>;
  version: Input<string>;
}
