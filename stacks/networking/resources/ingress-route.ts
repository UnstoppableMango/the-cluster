import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { CustomResourceOptions, Input } from '@pulumi/pulumi';

export class IngressRoute extends CustomResource {
  
  constructor(name: string, args: IngressRouteArgs, opts?: CustomResourceOptions) {
    super(name, {
      apiVersion: 'traefik.containo.us/v1alpha1',
      kind: 'IngressRoute',
      metadata: args.metadata,
      spec: {
        entryPoints: args.entrypoints,
        routes: [{
          match: args.match || IngressRoute.createMatch(args.hosts),
          kind: 'Rule',
          services: [{
            name: 'api@internal',
            kind: 'TraefikService',
          }],
        }],
      },
    }, opts);
  }

  private static createMatch(hosts: string | string[]): string {
    if (Array.isArray(hosts)) {
      return hosts.map(x => `Host('${x}')`).join(' || ');
    } else {
      return `Host('${hosts}')`;
    }
  }

}

interface ObjectMeta {
  name?: Input<string>;
  namespace?: Input<string>;
}

export interface IngressRouteArgs {
  metadata?: ObjectMeta;
  entrypoints: Array<'web' | 'websecure'>;
  hosts: string | string[];
  match?: string;
}
