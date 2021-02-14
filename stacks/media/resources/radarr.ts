import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class Radarr extends ComponentResource {

  private readonly getName = getNameResolver('radarr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly media: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingress: k8s.networking.v1.Ingress;

  constructor(private name: string, private args: RadarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:radarr', name, undefined, opts);

    this.config = new kx.PersistentVolumeClaim(this.getName('data'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '2Gi' } },
      },
    }, { parent: this });
  
    this.media = new kx.PersistentVolumeClaim(this.getName('media'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
        resources: { requests: { storage: '5000Gi' } },
        storageClassName: 'nfs',
        volumeName: this.args.moviesVolume.metadata.name,
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
        image: 'harbor.int.unmango.net/docker.io/linuxserver/radarr:version-3.0.2.4552',
        envFrom: [{
          configMapRef: { name: this.args.linuxServer.metadata.name },
        }],
        ports: {
          http: 7878,
        },
        volumeMounts: [
          this.config.mount('/config'),
          this.media.mount('/movies'),
          this.args.downloads.mount('/downloads', 'completed'),
        ],
      }],
    });
  
    this.deployment = new kx.Deployment(this.getName('deployment'), {
      metadata: { namespace: this.args.namespace },
      spec: pb.asDeploymentSpec({
        strategy: { type: 'Recreate' },
      }),
    }, { parent: this });
  
    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
      ports: [{ name: 'http', port: 7878, targetPort: 7878 }],
    });

    this.ingress = new k8s.networking.v1.Ingress(this.getName('ingress'), {
      metadata: { namespace: args.namespace },
      spec: {
        rules: [{
          host: `${this.name}.int.unmango.net`,
          http: {
            paths: [{
              backend: {
                service: {
                  name: this.service.metadata.name,
                  port: { name: 'http' },
                },
              },
              // TODO: Required ✓, Correct?
              pathType: 'ImplementationSpecific',
            }],
          },
        }],
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface RadarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: kx.PersistentVolumeClaim;
  moviesVolume: k8s.core.v1.PersistentVolume;
}
