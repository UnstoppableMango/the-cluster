import * as kx from '@pulumi/kubernetesx';
import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { getNameResolver } from '@unmango/shared';

export class Deemix extends ComponentResource {

  private readonly getName = getNameResolver('deemix', this.name);

  public readonly configPvc: kx.PersistentVolumeClaim;
  // public readonly downloadsPv: k8s.core.v1.PersistentVolume;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  public readonly ingress: k8s.networking.v1.Ingress;

  constructor(private name: string, args: DeemixArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:deemix', name, undefined, opts);

    this.configPvc = new kx.PersistentVolumeClaim(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '5Gi' } },
      },
    }, { parent: this });

    // this.downloadsPv = new k8s.core.v1.PersistentVolume(this.getName(), {
    //   metadata: { namespace: args.namespace },
    //   spec: {
    //     accessModes: ['ReadWriteOnce'],
    //     nfs: {
    //       server: 'zeus',
    //       path: '/tank1/media/music',
    //     },
    //   },
    // }, { parent: this });

    const pb = new kx.PodBuilder({
      // LSIO alpine based image
      dnsConfig: { options: [{ name: 'ndots', value: '1' }] },
      volumes: [{
        name: 'downloads',
        nfs: {
          server: 'zeus',
          path: '/tank1/media/music',
        },
      }],
      containers: [{
        image: 'registry.gitlab.com/bockiii/deemix-docker',
        env: {
          PUID: '1001',
          PGID: '1001',
          ARL: args.arl,
          // UMASK_SET: '022',
          DEEZUI: 'false', // Enables Deezloader UI
        },
        ports: {
          http: 6595,
        },
        volumeMounts: [
          this.configPvc.mount('/config'),
          { name: 'downloads', mountPath: '/downloads' },
        ],
      }],
    });

    this.deployment = new kx.Deployment(this.getName(),{
      metadata: { namespace: args.namespace },
      spec: pb.asDeploymentSpec({
        strategy: {
          rollingUpdate: { maxSurge: 0, maxUnavailable: '100%' },
        },
      }),
    }, { parent: this });

    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
    });

    this.ingress = new k8s.networking.v1.Ingress(this.getName(), {
      metadata: { namespace: args.namespace },
      spec: {
        rules: [{
          host: 'deemix.int.unmango.net',
          http: {
            paths: [{
              pathType: 'ImplementationSpecific',
              backend: {
                service: {
                  name: this.service.metadata.name,
                  port: { name: 'http' },
                },
              },
            }],
          },
        }],
      },
    }, { parent: this });
  }

}

export interface DeemixArgs {
  namespace: Input<string>;
  arl: Input<string>;
}
