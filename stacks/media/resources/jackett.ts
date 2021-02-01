import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Jackett extends ComponentResource {

  public readonly config = new kx.PersistentVolumeClaim(this.getName('config'), {
    metadata: { namespace: this.args.namespace },
    spec: {
      storageClassName: 'longhorn',
      accessModes: ['ReadWriteOnce'],
      resources: { requests: { storage: '1Gi' } },
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
      image: 'linuxserver/jackett',
      envFrom: [{
        configMapRef: { name: this.args.linuxServer.metadata.name },
      }],
      env: {
        AUTO_UPDATE: 'true', // Optional
        // RUN_OPTS: '', // Optional
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

  public readonly deployment = new kx.Deployment(this.getName(), {
    metadata: { namespace: this.args.namespace },
    spec: this._pb.asDeploymentSpec(),
  }, { parent: this });

  public readonly service = this.deployment.createService({
    type: kx.types.ServiceType.LoadBalancer,
    ports: [{ name: 'http', port: 9117, targetPort: 9117 }],
  })

  constructor(private name: string, private args: JackettArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:jackett', name, undefined, opts);
    this.registerOutputs();
  }

  private getName(name?: string): string {
    let values = [...new Set(['jackett', this.name])];
    if (name) values = values.concat(name);
    return values.join('-');
  }

}

export interface JackettArgs {
  namespace: Input<string>;
  linuxServer: kx.ConfigMap;
}
