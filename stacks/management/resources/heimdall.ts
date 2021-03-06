import { Namespace } from '@pulumi/rancher2';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { IngressRoute } from '@unmango/custom-resources';
import { getNameResolver } from '@unmango/shared';

export class Heimdall extends ComponentResource {

  private readonly getName = getNameResolver('heimdall', this.name);

  public readonly namespace: Namespace;
  public readonly config: kx.ConfigMap;
  public readonly pvc: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: kx.Service;
  // public readonly ingress: Ingress;
  public readonly ingressRoute: IngressRoute;

  constructor(private name: string, args: HeimdallArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:heimdall', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      name: this.getName(),
      projectId: args.projectId,
    }, { parent: this });

    this.config = new kx.ConfigMap(this.getName(), {
      metadata: { namespace: this.namespace.name },
      data: {
        // puid: args.puid ?? '0',
        // pgid: args.pgid ?? '0',
        tz: args.tz ?? 'America/Chicago',
      },
    }, { parent: this });

    this.pvc = new kx.PersistentVolumeClaim(this.getName(), {
      metadata: { namespace: this.namespace.name },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '1Gi' } },
      },
    }, { parent: this });

    const pb = new kx.PodBuilder({
      // Refs about this BS:
      // https://stackoverflow.com/a/65593511/7341217
      // Some motherfucking bullshit
      dnsConfig: { options: [{ name: 'ndots', value: '2' }] },
      containers: [{
        image: 'harbor.int.unmango.net/docker.io/linuxserver/heimdall:version-2.2.2',
        env: {
          // TODO: Need to overwrite in .env file (/config/www/.env)
          // https://github.com/linuxserver/Heimdall/issues/132#issuecomment-490436167
          APP_NAME: args.titlebarText ?? 'Heimdall',
          // PUID: this.config.asEnvValue('puid'),
          // PGID: this.config.asEnvValue('pgid'),
          TZ: this.config.asEnvValue('tz'),
          // DOCKER_MODS: 'linuxserver/mods:universal-tshoot',
        },
        ports: {
          http: 80,
          https: 443,
        },
        volumeMounts: [this.pvc.mount('/config')],
      }],
    });

    this.deployment = new kx.Deployment(this.getName(), {
      metadata: { namespace: this.namespace.name },
      spec: pb.asDeploymentSpec({
        strategy: {
          rollingUpdate: {
            // So the PVC doesn't lock
            maxSurge: 0,
            maxUnavailable: '100%',
          },
        },
      }),
    }, { parent: this });

    this.service = this.deployment.createService({
      // kx passes all ports by default
      type: kx.types.ServiceType.ClusterIP,
    });

    // this.ingress = new Ingress('heimdall', {
    //   metadata: { namespace: this.namespace.name },
    //   spec: {
    //     rules: [{
    //       host: 'heimdall.int.unmango.net',
    //       http: {
    //         paths: [{
    //           backend: {
    //             service: {
    //               name: this.service.metadata.name,
    //               port: { name: 'https' },
    //             },
    //           },
    //           // TODO: Required ✓, Correct?
    //           pathType: 'ImplementationSpecific',
    //         }],
    //       },
    //     }],
    //   },
    // }, { parent: this });

    this.ingressRoute = new IngressRoute(this.getName(), {
      metadata: { namespace: this.namespace.name },
      entrypoints: ['websecure'],
      hosts: [args.hostname],
      services: [{
        name: this.service.metadata.name,
        port: 80,
      }],
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface HeimdallArgs {
  projectId: Input<string>;
  hostname: Input<string>;
  titlebarText?: Input<string>;
  puid?: Input<string>;
  pgid?: Input<string>;
  tz?: Input<string>;
}
