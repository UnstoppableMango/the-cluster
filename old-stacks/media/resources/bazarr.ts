import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';
import { matchBuilder } from '@unmango/shared/traefik';

export class Bazarr extends ComponentResource {

  private readonly getName = getNameResolver('bazarr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: k8s.core.v1.Service;
  public readonly ingressRoute: traefik.IngressRoute;

  constructor(private name: string, private args: BazarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:bazarr', name, undefined, opts);

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
      volumes: pulumi.output(args.nfsMounts).apply(m => m.map(x => ({
        name: x.name,
        nfs: {
          server: x.server,
          path: x.sourcePath,
        },
      }))),
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        securityContext: {
          privileged: true,
        },
        image: 'linuxserver/bazarr:v1.0.1-ls140',
        envFrom: [{
          configMapRef: {
            name: this.args.linuxServer.metadata.name
          },
        }],
        env: {
          DOCKER_MODS: 'ghcr.io/gilbn/theme.park:bazarr',
          TP_THEME: 'plex',
        },
        ports: {
          http: 6767,
        },
        volumeMounts: pulumi
          .all([args.nfsMounts, this.config.mount('/config')])
          .apply(([mounts, config]) => {
            const volumes = mounts.map(x => ({
              name: x.name,
              mountPath: x.destPath,
            }));
    
            return [config, ...volumes];
          }),
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
          { name: 'http', port: 6767, targetPort: 6767 },
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

interface Nfs {
  name: Input<string>;
  server: Input<string>;
  sourcePath: Input<string>;
  destPath: Input<string>;
}

export interface BazarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  nfsMounts: Input<Input<Nfs>[]>;
}
