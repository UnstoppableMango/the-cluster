import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Radarr extends ComponentResource {

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
      volumeName: this.args.moviesVolume.metadata.name,
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
      image: 'linuxserver/radarr',
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

  public readonly deployment = new kx.Deployment(this.getName(), {
    metadata: { namespace: this.args.namespace },
    spec: this._pb.asDeploymentSpec(),
  }, { parent: this });

  public readonly service = this.deployment.createService({
    type: kx.types.ServiceType.LoadBalancer,
    ports: [{ name: 'http', port: 7878, targetPort: 7878 }],
  })

  constructor(private name: string, private args: RadarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:radarr', name, undefined, opts);
    this.registerOutputs();
  }

  private getName(name?: string): string {
    let values = [...new Set(['radarr', this.name])];
    if (name) values = values.concat(name);
    return values.join('-');
  }

}

export interface RadarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: kx.PersistentVolumeClaim;
  moviesVolume: k8s.core.v1.PersistentVolume;
}
