import * as k8s from '@pulumi/kubernetes/apiextensions';
import * as pulumi from '@pulumi/pulumi';

export class IngressRoute extends k8s.CustomResource {
  
  constructor(name: string, args: IngressRouteArgs, opts?: pulumi.CustomResourceOptions) {
    super(name, {
      apiVersion: 'traefik.containo.us/v1alpha1',
      kind: 'IngressRoute',
      metadata: args.metadata,
      spec: {
        entryPoints: args.entrypoints,
        routes: [{
          match: args.match || IngressRoute.createMatch(args.hosts),
          kind: 'Rule',
          services: args.services,
        }],
      },
    }, opts);
  }

  private static createMatch(hosts: string | string[]): string {
    if (Array.isArray(hosts)) {
      return hosts.map(x => `Host(\`${x}\`)`).join(' || ');
    } else {
      return `Host(\`${hosts}\`)`;
    }
  }

}

type Entrypoint = 'web' | 'websecure';

interface ObjectMeta {
  name?: pulumi.Input<string>;
  namespace?: pulumi.Input<string>;
}

interface IngressRouteService {
  name: pulumi.Input<string>;
  kind: pulumi.Input<string>;
}

export interface IngressRouteArgs {
  metadata?: ObjectMeta;
  entrypoints: Entrypoint[];
  hosts: string | string[];
  match?: string;
  services: IngressRouteService[];
}
