import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';
import { matchBuilder } from '@unmango/shared/traefik';

export class Sonarr extends ComponentResource {

  private readonly getName = getNameResolver('sonarr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingressRoute: traefik.IngressRoute;

  constructor(private name: string, private args: SonarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:sonarr', name, undefined, opts);

    this.config = new kx.PersistentVolumeClaim(this.getName(), {
      metadata: {
        name: this.getName(),
        namespace: this.args.namespace,
      },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '5Gi' } },
      },
    }, { parent: this });
  
    const pb = new kx.PodBuilder({
      volumes: [
        { name: 'downloads', nfs: args.downloads },
        { name: 'tv', nfs: args.tv },
      ],
      dnsConfig: { options: [{ name: 'ndots', value: '1' }] },
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        securityContext: {
          privileged: true,
        },
        image: 'linuxserver/sonarr:3.0.8.1507-ls148',
        envFrom: [{
          configMapRef: {
            name: this.args.linuxServer.metadata.name,
          },
        }],
        env: {
          DOCKER_MODS: 'ghcr.io/gilbn/theme.park:sonarr',
          TP_THEME: 'plex',
        },
        ports: {
          http: 8989,
        },
        volumeMounts: [
          this.config.mount('/config'),
          { name: 'downloads', mountPath: '/downloads' },
          { name: 'tv', mountPath: '/tv' },
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
  
    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
    });

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

interface NfsArgs {
  server: Input<string>;
  path: Input<string>;
}

export interface SonarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: Input<NfsArgs>;
  tv: Input<NfsArgs>;
}
