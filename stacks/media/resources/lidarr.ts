import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';

export class Lidarr extends ComponentResource {

  private readonly getName = getNameResolver('lidarr', this.name);

  public readonly config: kx.PersistentVolumeClaim;
  public readonly media: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingress: k8s.networking.v1.Ingress;

  constructor(private name: string, private args: LidarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:lidarr', name, undefined, opts);

    this.config = new kx.PersistentVolumeClaim(this.getName('config'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce', 'ReadWriteMany'],
        resources: { requests: { storage: '2Gi' } },
      },
    }, { parent: this });
  
    this.media = new kx.PersistentVolumeClaim(this.getName('media'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
        resources: { requests: { storage: '5000Gi' } },
        storageClassName: 'nfs',
        volumeName: this.args.musicVolume.metadata.name,
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
        image: 'linuxserver/lidarr',
        envFrom: [{
          configMapRef: { name: this.args.linuxServer.metadata.name },
        }],
        ports: {
          http: 8686,
        },
        volumeMounts: [
          this.config.mount('/config'),
          this.media.mount('/music'),
          this.args.downloads.mount('/downloads', 'completed'),
        ],
      }],
    });
  
    this.deployment = new kx.Deployment(this.getName(), {
      metadata: { namespace: this.args.namespace },
      spec: pb.asDeploymentSpec(),
    }, { parent: this });
  
    this.service = this.deployment.createService({
      type: kx.types.ServiceType.LoadBalancer,
      ports: [{ name: 'http', port: 8686, targetPort: 8686 }],
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

export interface LidarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: kx.PersistentVolumeClaim;
  musicVolume: k8s.core.v1.PersistentVolume;
}
