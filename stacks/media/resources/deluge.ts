import * as fs from 'fs/promises';
import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input, Output } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import * as util from '@unmango/shared/util';
import { Pia } from './pia';

export class Deluge extends ComponentResource {

  private readonly getName = util.getNameResolver('deluge', this.name);

  public readonly configPvc: kx.PersistentVolumeClaim;
  public readonly auth: kx.Secret;
  public readonly env: kx.ConfigMap;
  public readonly confOverride: kx.ConfigMap;
  public readonly piaSecret: kx.Secret;
  public readonly downloads: kx.PersistentVolumeClaim;
  public readonly deployment: kx.Deployment;
  public readonly service: k8s.core.v1.Service;
  public readonly daemonService: k8s.core.v1.Service;
  public readonly ingress: k8s.networking.v1.Ingress;
  public readonly updateConfig?: k8s.batch.v1.Job;

  constructor(private name: string, private args: DelugeArgs, private opts?: ComponentResourceOptions) {
    super('unmango:apps:deluge', name, undefined, opts);

    this.configPvc = new kx.PersistentVolumeClaim(this.getName('config'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        storageClassName: 'longhorn',
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '1Gi' } },
      },
    }, { parent: this });
  
    this.auth = new kx.Secret(this.getName('auth'), {
      metadata: { namespace: this.args.namespace },
      stringData: { auth: this.getAuthValue() },
    }, { parent: this });
  
    this.env = new kx.ConfigMap(this.getName('deluge'), {
      metadata: { namespace: this.args.namespace },
      data: {
        VPN_ENABLED: 'yes',
        VPN_USER: this.args.pia.user,
        VPN_PROV: 'pia',
        VPN_CLIENT: 'wireguard', // <openvpn,wireguard>
        // VPN_OPTIONS=<additional openvpn cli options> \
        STRICT_PORT_FORWARD: 'yes',
        ENABLE_PRIVOXY: 'no',
        LAN_NETWORK: '192.168.1.0/24', // CIDR notation
        NAME_SERVERS: this.args.pia.nameservers.join(','),
        DELUGE_DAEMON_LOG_LEVEL: 'error', // <critical|error|warning|info|debug>
        DELUGE_WEB_LOG_LEVEL: 'error', // <critical|error|warning|info|debug>
        // ADDITIONAL_PORTS: '',
        DEBUG: 'true',
        UMASK: '000',
        PUID: '0',
        PGID: '0',
      },
    }, { parent: this });

    const coreConf = fs.readFile('./resources/deluge/core.conf', { encoding: 'utf8' });
    const baseConf = fs.readFile('./resources/deluge/base.conf', { encoding: 'utf8' });
    const mergeSh = fs.readFile('./resources/deluge/merge.sh', { encoding: 'utf8' });
    this.confOverride = new kx.ConfigMap(this.getName('conf-override'), {
      metadata: { namespace: args.namespace },
      data: {
        'core.conf': pulumi.output(coreConf),
        'base.conf': pulumi.output(baseConf),
        'merge.sh': pulumi.output(mergeSh),
      },
    }, { parent: this });
  
    this.piaSecret = new kx.Secret(this.getName('pia'), {
      metadata: { namespace: this.args.namespace },
      stringData: { password: this.args.pia.password },
    }, { parent: this });
  
    this.downloads = new kx.PersistentVolumeClaim(this.getName('downloads'), {
      metadata: { namespace: this.args.namespace },
      spec: {
        accessModes: ['ReadWriteMany'],
        resources: { requests: { storage: '1000Gi' } },
        storageClassName: 'nfs-client',
      },
    }, { parent: this });
  
    const pb = new kx.PodBuilder({
      securityContext: {
        sysctls: [{
          // Need to update cluster config to pass
          // --allowed-unsafe-sysctls 'net.ipv4.conf.all.src_valid_mark'
          // to kubelet in order for this to work
          name: 'net.ipv4.conf.all.src_valid_mark', value: '1',
        }],
      },
      nodeSelector: {
        wireguard: 'true',
      },
      volumes: [{
        name: this.getName('auth'),
        secret: { secretName: this.auth.metadata.name },
      }],
      initContainers: [{
        name: this.getName('init'),
        image: 'harbor.int.unmango.net/docker.io/library/busybox',
        command: ['cp', '/auth', '/config/auth'],
        volumeMounts: [{
          name: this.getName('auth'),
          mountPath: '/auth',
          subPath: 'auth',
        }, {
          name: this.configPvc.metadata.name,
          mountPath: '/config',
        }],
      }],
      containers: [{
        // kx sets the selector to the container name.
        // With multiple resources, it won't match correctly, so
        // this is mostly a hack to get service discovery to work.
        name: this.getName(),
        securityContext: {
          privileged: true,
        },
        // TODO: Allow passing version
        image: 'harbor.int.unmango.net/docker.io/binhex/arch-delugevpn:2.0.4.dev38-g23a48dd01-3-06',
        envFrom: [{ configMapRef: { name: this.env.metadata.name } }],
        env: {
          VPN_PASS: this.piaSecret.asEnvValue('password'),
        },
        ports: {
          http: 8112,
          // privoxy: 8118,
          daemon: 58846,
          // incoming: 58946,
        },
        volumeMounts: [
          this.configPvc.mount('/config'),
          this.downloads.mount('/data'),
        ],
      }],
    });
  
    this.deployment = new kx.Deployment(this.getName('deluge'), {
      metadata: { namespace: this.args.namespace },
      spec: pb.asDeploymentSpec(),
    }, { parent: this });
  
    this.service = new k8s.core.v1.Service(this.getName('http'), {
      metadata: {
        name: 'deluge',
        namespace: args.namespace,
      },
      spec: {
        type: kx.types.ServiceType.ClusterIP,
        selector: this.deployment.spec.selector.matchLabels,
        ports: [
          { name: 'http', port: 8112, targetPort: 8112 },
          // { name: 'privoxy', port: 8118, targetPort: 8118 },
          // For the Web UI
          { name: 'daemon', port: 58846, targetPort: 58846 },
        ],
      },
    }, { parent: this });
  
    this.daemonService = new k8s.core.v1.Service(this.getName('daemon'), {
      metadata: {
        name: 'deluge-daemon',
        namespace: args.namespace,
      },
      spec: {
        type: kx.types.ServiceType.LoadBalancer,
        selector: this.deployment.spec.selector.matchLabels,
        loadBalancerIP: '192.168.1.76',
        ports: [
          { name: 'daemon', port: 58846, targetPort: 58846 },
          // Used only if VPN_ENABLED=no
          // { name: 'incoming', port: 58946, targetPort: 58946 },
        ],
      },
    }, { parent: this });

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

    // this.updateConfig = new k8s.batch.v1.Job(this.getName('config'), {
    //   metadata: { namespace: args.namespace },
    //   spec: {
    //     completions: 1,
    //     ttlSecondsAfterFinished: 60,
    //     template: {
    //       spec: {
    //         restartPolicy: 'Never',
    //         volumes: [{
    //           name: 'config',
    //           persistentVolumeClaim: {
    //             claimName: this.configPvc.metadata.name,
    //           },
    //         }, {
    //           name: 'override',
    //           configMap: {
    //             name: this.confOverride.metadata.name,
    //           },
    //         }],
    //         containers: [{
    //           name: this.getName(),
    //           // image: 'stedolan/jq',
    //           image: 'realguess/jq',
    //           command: [
    //             '/bin/sh',
    //             '/override/merge.sh',
    //             './config/core.conf',
    //             './override/core.conf',
    //             './override/base.conf',
    //           ],
    //           volumeMounts: [{
    //             name: 'config',
    //             mountPath: '/config',
    //           }, {
    //             name: 'override',
    //             mountPath: '/override',
    //           }],
    //         }],
    //       },
    //     },
    //   },
    // }, { parent: this });

    this.registerOutputs();
  }

  private getAuthValue(): Output<string> {
    const { username, password } = this.args.deluge;
    return Output.create(`${username}:${password}:${Permissions.Admin}\n`);
  }

}

export enum Permissions {
  Admin = 10,
}

export interface DelugeConfig {
  username: string;
  password: string;
}

export interface DelugeArgs {
  deluge: DelugeConfig;
  namespace: Input<string>;
  pia: Pia;
  projectId: Input<string>;
}
