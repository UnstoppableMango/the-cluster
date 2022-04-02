import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';
import { matchBuilder } from '@unmango/shared/traefik';

export class Overseerr extends ComponentResource {

  private readonly getName = getNameResolver('overseerr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: k8s.core.v1.Service;
  public readonly ingressRoute: traefik.IngressRoute;

  constructor(private name: string, private args: OverseerrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:overseerr', name, undefined, opts);

    this.config = new kx.PersistentVolumeClaim(this.getName(), {
      metadata: {
        name: this.getName(),
        namespace: this.args.namespace,
      },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '1Gi' } },
      },
    }, { parent: this });
  
    const pb = new kx.PodBuilder({
      // Uses alpine base image with ndots problem, and needs to
      // be able to resolve 'plex.tv'
      dnsConfig: { options: [{ name: 'ndots', value: '1' }] },
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        image: 'lscr.io/linuxserver/overseerr:v1.29.0-ls29',
        envFrom: [{
          configMapRef: { name: this.args.linuxServer.metadata.name },
        }],
        ports: {
          http: 5055,
        },
        volumeMounts: [
          this.config.mount('/config'),
        ],
      }],
    });
  
    this.deployment = new kx.Deployment(this.getName(), {
      metadata: {
        name: this.getName(),
        namespace: this.args.namespace,
      },
      spec: pb.asDeploymentSpec({
        strategy: { type: 'Recreate' },
      }),
    }, { parent: this });

    this.service = new k8s.core.v1.Service(this.getName(), {
      metadata: {
        name: this.getName(),
        namespace: args.namespace,
      },
      spec: {
        type: kx.types.ServiceType.ClusterIP,
        selector: this.deployment.spec.selector.matchLabels,
        ports: [
          { name: 'http', port: 5055, targetPort: 5055 },
        ],
      },
    }, { parent: this });

    this.ingressRoute = new traefik.IngressRoute(this.getName(), {
      metadata: {
        name: this.getName(),
        namespace: this.args.namespace,
      },
      spec: {
        entryPoints: ['websecure'],
        routes: [{
          kind: 'Rule',
          match: matchBuilder()
            .host('media.int.unmango.net').and().pathPrefix(`/${this.name}`)
            .or().host(`${this.name}.int.unmango.net`)
            .build(),
          services: [{
            name: this.service.metadata.name,
            port: this.service.spec.ports[0].port,
          }],
        }],
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface OverseerrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
}
