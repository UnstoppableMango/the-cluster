import * as k8s from '@pulumi/kubernetes/apiextensions';
import { CustomResourceOptions, Input, Output } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';

export class IngressRoute extends k8s.CustomResource {

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
          services: args.services,
        }],
      },
    }, opts);
  }

  private static createMatch(hosts: Input<string | Input<string>[]>): Output<string> {
    return pulumi.output(hosts).apply(unwrapped => {
      if (Array.isArray(unwrapped)) {
        return unwrapped.map(x => `Host(\`${x}\`)`).join(' || ');
      } else {
        return `Host(\`${unwrapped}\`)`;
      }
    });
  }

}

type Entrypoint = 'web' | 'websecure';

interface ObjectMeta {
  name?: Input<string>;
  namespace?: Input<string>;
}

interface IngressRouteService {
  name: Input<string>;
  kind?: Input<string>;
  namespace?: Input<string>;
  port?: Input<number>;
  passHostHeader?: Input<boolean>;
  scheme?: Input<string>;
}

export interface IngressRouteArgs {
  metadata?: Input<ObjectMeta>;
  entrypoints: Input<Input<Entrypoint>[]>;
  hosts: Input<string | Input<string>[]>;
  match?: Input<string>;
  services: Input<Input<IngressRouteService>[]>;
}
