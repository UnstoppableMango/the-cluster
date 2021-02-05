import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared/util';
import { LinuxServerConfig } from './linuxserver';

export class Jackett extends ComponentResource {

  private readonly getName = getNameResolver('jackett', this.name);

  public readonly config: kx.ConfigMap;
  public readonly configPvc: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingress: k8s.networking.v1.Ingress;

  constructor(private name: string, private args: JackettArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:jackett', name, undefined, opts);

    this.config = new kx.ConfigMap(this.getName(), {
      metadata: { namespace: args.namespace },
      data: {
        PUID: `${args.linuxServer.puid}`,
        PGID: `${args.linuxServer.pgid}`,
        TZ: args.linuxServer.tz,
      },
    });

    this.configPvc = new kx.PersistentVolumeClaim(this.getName('config'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce', 'ReadWriteMany'],
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
        image: 'linuxserver/jackett',
        envFrom: [{
          configMapRef: { name: this.config.metadata.name },
        }],
        env: {
          AUTO_UPDATE: 'true', // Optional
          // RUN_OPTS: '', // Optional
        },
        ports: {
          http: 9117,
        },
        volumeMounts: [
          this.configPvc.mount('/config'),
          // Docs mention needing a mount to pass .torrent files to
          // the download client... add back if needed?
          // this.args.downloads.mount('/downloads'),
        ],
      }],
    });
  
    this.deployment = new kx.Deployment(this.getName(), {
      metadata: { namespace: this.args.namespace },
      spec: pb.asDeploymentSpec(),
    }, { parent: this });
  
    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
      ports: [{ name: 'http', port: 9117, targetPort: 9117 }],
    });

    this.ingress = new k8s.networking.v1.Ingress(this.getName(), {
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

export interface JackettArgs {
  namespace: Input<string>;
  linuxServer: LinuxServerConfig;
}
