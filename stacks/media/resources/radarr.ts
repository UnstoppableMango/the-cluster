import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class Radarr extends ComponentResource {

  private readonly getName = getNameResolver('radarr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingressRoute: traefik.IngressRoute;

  constructor(private name: string, private args: RadarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:radarr', name, undefined, opts);

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
      volumes: [{
        name: 'downloads',
        nfs: this.args.downloads,
      }, {
        name: 'movies',
        nfs: this.args.movies,
      }],
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        securityContext: {
          privileged: true,
        },
        image: 'linuxserver/radarr:4.1.0.6175-ls143',
        envFrom: [{
          configMapRef: {
            name: this.args.linuxServer.metadata.name,
          },
        }],
        env: {
          DOCKER_MODS: 'ghcr.io/gilbn/theme.park:radarr',
          TP_THEME: 'plex',
        },
        ports: {
          http: 7878,
        },
        volumeMounts: [
          this.config.mount('/config'),
          { name: 'movies', mountPath: '/movies' },
          { name: 'downloads', mountPath: '/downloads' },
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
          match: `Host(\`media.int.unmango.net\`) && PathPrefix(\`/${this.name}\`)`,
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

interface Nfs {
  server: Input<string>;
  path: Input<string>;
}

export interface RadarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: Input<Nfs>;
  movies: Input<Nfs>;
}
