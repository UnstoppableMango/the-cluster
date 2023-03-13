import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';
import { matchBuilder } from '@unmango/shared/traefik';

export class Prowlarr extends ComponentResource {

  private readonly getName = getNameResolver('prowlarr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: k8s.core.v1.Service;
  public readonly ingressRoute: traefik.IngressRoute;

  constructor(private name: string, private args: ProwlarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:prowlarr', name, undefined, opts);

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
      dnsConfig: { options: [{ name: 'ndots', value: '1' }] },
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        securityContext: {
          privileged: true,
        },
        image: 'linuxserver/prowlarr:develop-1.3.1.2796-ls94',
        envFrom: [{
          configMapRef: { name: this.args.linuxServer.metadata.name },
        }],
        env: {
          DOCKER_MODS: 'ghcr.io/gilbn/theme.park:prowlarr',
          TP_THEME: 'plex',
          TZ: 'America/Chicago',
        },
        ports: {
          http: 9696,
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
          { name: 'http', port: 9696, targetPort: 9696 },
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

export interface ProwlarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
}
