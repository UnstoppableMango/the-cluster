import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { IngressRoute } from '@pulumi/crds/traefik/v1alpha1';
import { getNameResolver } from '@unmango/shared';
import { stopStartNewStrategy } from '@unmango/shared/deployment';

export class CodeServer extends ComponentResource {

  private readonly getName = getNameResolver('code-server', this.name);

  public readonly configPvc: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingressRoute: IngressRoute;

  constructor(private name: string, args: CodeServerArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:code-server', name, undefined, opts);

    const hostname = 'code.int.unmango.net';

    this.configPvc = new kx.PersistentVolumeClaim(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '5Gi' } },
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      containers: [{
        image: 'linuxserver/code-server:version-v3.9.0',
        env: {
          TZ: 'America/Chicago',
          PROXY_DOMAIN: hostname,
        },
        volumeMounts: [this.configPvc.mount('/config')],
        ports: { http: 8443 },
      }],
    });

    this.deployment = new kx.Deployment(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: pb.asDeploymentSpec({
        // replicas: 6,
        // For RWO longhorn PVC
        strategy: stopStartNewStrategy(),
      }),
    }, { parent: this });

    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
    });

    this.ingressRoute = new IngressRoute(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        entryPoints: ['websecure'],
        routes: [{
          kind: 'Route',
          match: `Host(\`${hostname}\`)`,
          services: [{
            name: this.service.metadata.name,
            port: 8443,
          }],
        }],
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface CodeServerArgs {
  namespace: Input<string>;
}
