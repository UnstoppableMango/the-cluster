import { Namespace } from '@pulumi/rancher2';
import { Ingress } from '@pulumi/kubernetes/networking/v1';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Heimdall extends ComponentResource {
  
  public readonly namespace: Namespace;
  public readonly config: kx.ConfigMap;
  public readonly pvc: kx.PersistentVolumeClaim;  
  public readonly deployment: kx.Deployment;  
  public readonly service: kx.Service;
  public readonly ingress: Ingress;

  constructor(name: string, args: HeimdallArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:heimdall', name, undefined, opts);

    this.namespace = new Namespace('heimdall', {
      name: 'heimdall',
      projectId: args.projectId,
    }, { parent: this });

    this.config = new kx.ConfigMap('heimdall', {
      metadata: { namespace: this.namespace.name },
      data: {
        // puid: args.puid ?? '0',
        // pgid: args.pgid ?? '0',
        tz: args.tz ?? 'America/Chicago',
      },
    }, { parent: this });

    this.pvc = new kx.PersistentVolumeClaim('heimdall', {
      metadata: { namespace: this.namespace.name },
      spec: {
        accessModes: ['ReadWriteOnce', 'ReadWriteMany'],
        resources: { requests: { storage: '1Gi' } },
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      containers: [{
        image: 'linuxserver/heimdall',
        env: {
          // PUID: this.config.asEnvValue('puid'),
          // PGID: this.config.asEnvValue('pgid'),
          TZ: this.config.asEnvValue('tz'),
        },
        ports: {
          http: 80,
          // Let Traefik handle TLS
          // https: 443,
        },
        volumeMounts: [this.pvc.mount('/config')],
      }],
    });

    this.deployment = new kx.Deployment('heimdall', {
      metadata: { namespace: this.namespace.name },
      spec: pb.asDeploymentSpec(),
    }, { parent: this });

    this.service = this.deployment.createService({
      type: kx.types.ServiceType.ClusterIP,
    });

    this.ingress = new Ingress('heimdall', {
      metadata: { namespace: this.namespace.name },
      spec: {
        rules: [{
          host: 'heimdall.int.unmango.net',
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

export interface HeimdallArgs {
  projectId: Input<string>;
  puid?: Input<string>;
  pgid?: Input<string>;
  tz?: Input<string>;
}
