import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Lidarr extends ComponentResource {

  public readonly config = new kx.PersistentVolumeClaim(this.getName('config'), {
    metadata: { namespace: this.args.namespace },
    spec: {
      storageClassName: 'longhorn',
      accessModes: ['ReadWriteOnce'],
      resources: { requests: { storage: '2Gi' } },
    },
  }, { parent: this });

  public readonly media = new kx.PersistentVolumeClaim(this.getName('media'), {
    metadata: { namespace: this.args.namespace },
    spec: {
      accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
      resources: { requests: { storage: '5000Gi' } },
      storageClassName: 'nfs',
      volumeName: this.args.musicVolume.metadata.name,
    },
  }, { parent: this });

  private readonly _pb = new kx.PodBuilder({
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

  public readonly deployment = new kx.Deployment(this.getName(), {
    metadata: { namespace: this.args.namespace },
    spec: this._pb.asDeploymentSpec(),
  }, { parent: this });

  public readonly service = this.deployment.createService({
    type: kx.types.ServiceType.LoadBalancer,
    ports: [{ name: 'http', port: 8686, targetPort: 8686 }],
  })

  constructor(private name: string, private args: LidarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:lidarr', name, undefined, opts);
    this.registerOutputs();
  }

  private getName(name?: string): string {
    let values = [...new Set(['lidarr', this.name])];
    if (name) values = values.concat(name);
    return values.join('-');
  }

}

export interface LidarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: kx.PersistentVolumeClaim;
  musicVolume: k8s.core.v1.PersistentVolume;
}
