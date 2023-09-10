import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared';

export class Deemix extends ComponentResource {

  private readonly getName = getNameResolver('deemix', this.name);

  public readonly configPvc: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly ingressRoute: traefik.IngressRoute;
  public readonly service: kx.Service;

  constructor(private name: string, args: DeemixArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:deemix', name, undefined, opts);

    this.configPvc = new kx.PersistentVolumeClaim(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '5Gi' } },
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      // LSIO alpine based image
      dnsConfig: { options: [{ name: 'ndots', value: '1' }] },
      volumes: [{
        name: 'downloads',
        nfs: {
          server: 'zeus',
          path: '/tank1/media/music',
        },
      }],
      containers: [{
        image: 'registry.gitlab.com/bockiii/deemix-docker',
        env: {
          PUID: '1000',
          PGID: '1001',
          UMASK_SET: '022', // 0755
          REVERSEPROXY: 'true',
        },
        ports: {
          http: 6595,
        },
        volumeMounts: [
          this.configPvc.mount('/config'),
          { name: 'downloads', mountPath: '/downloads' },
        ],
      }],
    });

    this.deployment = new kx.Deployment(this.getName(),{
      metadata: { namespace: args.namespace },
      spec: pb.asDeploymentSpec({
        strategy: {
          rollingUpdate: { maxSurge: 0, maxUnavailable: '100%' },
        },
      }),
    }, { parent: this });

    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
    });

    this.ingressRoute = new traefik.IngressRoute(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        entryPoints: ['websecure'],
        routes: [{
          kind: 'Rule',
          match: 'Host(`deemix.int.unmango.net`)',
          services: [{
            name: this.service.metadata.name,
            port: this.service.spec.ports[0].port,
          }],
        }],
      },
    });
  }

}

export interface DeemixArgs {
  namespace: Input<string>;
}
