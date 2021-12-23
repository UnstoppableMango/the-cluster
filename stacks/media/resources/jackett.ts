import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class Jackett extends ComponentResource {

  private readonly getName = getNameResolver('jackett', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: k8s.core.v1.Service;
  public readonly ingressRoute: traefik.IngressRoute;

  constructor(private name: string, private args: JackettArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:jackett', name, undefined, opts);

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
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        securityContext: {
          privileged: true,
        },
        image: 'linuxserver/jackett:v0.20.195-ls54',
        envFrom: [{
          configMapRef: { name: this.args.linuxServer.metadata.name },
        }],
        env: {
          AUTO_UPDATE: 'true', // Optional
          // RUN_OPTS: '', // Optional
          DOCKER_MODS: 'ghcr.io/gilbn/theme.park:jackett',
          TP_THEME: 'plex',
        },
        ports: {
          http: 9117,
        },
        volumeMounts: [
          this.config.mount('/config'),
          // Docs mention needing a mount to pass .torrent files to
          // the download client... add back if needed?
          // this.args.downloads.mount('/downloads'),
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
          { name: 'http', port: 9117, targetPort: 9117 },
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
          match: `Host(\`media.int.unmango.net\`) && PathPrefix(\`/${this.name}\`) || Host(\`${this.name}.int.unmango.net\`)`,
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

export interface JackettArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
}
