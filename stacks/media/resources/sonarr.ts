import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Sonarr extends ComponentResource {

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
      volumeName: this.args.tvVolume.metadata.name,
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
      image: 'linuxserver/sonarr',
      envFrom: [{
        configMapRef: { name: this.args.linuxServer.metadata.name },
      }],
      ports: {
        http: 8989,
      },
      volumeMounts: [
        this.config.mount('/config'),
        this.media.mount('/tv'),
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
    ports: [{ name: 'http', port: 8989, targetPort: 8989 }],
  })

  constructor(private name: string, private args: SonarrArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:sonarr', name, undefined, opts);
    this.registerOutputs();
  }

  private getName(name?: string): string {
    let values = [...new Set(['sonarr', this.name])];
    if (name) values = values.concat(name);
    return values.join('-');
  }

}

export interface SonarrArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
  downloads: kx.PersistentVolumeClaim;
  tvVolume: k8s.core.v1.PersistentVolume;
}
