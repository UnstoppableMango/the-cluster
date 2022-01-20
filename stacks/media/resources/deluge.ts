import * as fs from 'fs/promises';
import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input, Output } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import * as util from '@unmango/shared/util';
import * as traefik from '@pulumi/crds/traefik/v1alpha1';

export class Deluge extends ComponentResource {

  private readonly getName = util.getNameResolver('deluge', this.name);

  public readonly configPvc: kx.PersistentVolumeClaim;
  public readonly auth: kx.Secret;
  public readonly piaSecret: kx.Secret;
  public readonly deployment: kx.Deployment;
  public readonly service: k8s.core.v1.Service;
  public readonly daemonService: k8s.core.v1.Service;
  public readonly ingressRoute: traefik.IngressRoute;
  public readonly updateConfig?: k8s.batch.v1.Job;

  constructor(private name: string, private args: DelugeArgs, private opts?: ComponentResourceOptions) {
    super('unmango:apps:deluge', name, undefined, opts);

    const storageArgs = pulumi.output(args.storage);

    this.configPvc = new kx.PersistentVolumeClaim(this.getName('config'), {
      metadata: {
        name: this.getName('config'),
        namespace: this.args.namespace,
      },
      spec: {
        accessModes: storageArgs.accessModes,
        resources: { requests: { storage: storageArgs.size } },
        storageClassName: storageArgs.class,
      },
    }, { parent: this });
  
    this.auth = new kx.Secret(this.getName('auth'), {
      metadata: {
        name: this.getName('auth'),
        namespace: this.args.namespace,
      },
      stringData: { auth: this.getAuthValue() },
    }, { parent: this });
  
    this.piaSecret = new kx.Secret(this.getName('pia'), {
      metadata: {
        name: this.getName('pia'),
        namespace: this.args.namespace,
      },
      stringData: { password: this.args.pia.password },
    }, { parent: this });
  
    const pb = new kx.PodBuilder({
      securityContext: {
        sysctls: [{
          // Requires kubelet arg --allowed-unsafe-sysctls 'net.ipv4.conf.all.src_valid_mark'
          name: 'net.ipv4.conf.all.src_valid_mark', value: '1',
        }],
      },
      nodeSelector: {
        wireguard: 'true',
      },
      volumes: [{
        name: this.getName('auth'),
        secret: { secretName: this.auth.metadata.name },
      }, {
        name: 'downloads',
        nfs: {
          server: 'zeus',
          path: '/tank1/downloads',
        },
      }],
      initContainers: [{
        // Create a user for remote connections
        name: this.getName('copy-auth'),
        image: 'busybox',
        command: ['cp', '/auth', '/config/auth'],
        volumeMounts: [{
          name: this.getName('auth'),
          mountPath: '/auth',
          subPath: 'auth',
        }, {
          name: this.configPvc.metadata.name,
          mountPath: '/config',
        }],
      }, {
        // Fixes an issue that seems to come up in
        // the WebUI when re-creating the pod
        name: this.getName('clear-hostlist'),
        image: 'busybox',
        command: ['rm', '-f', '--', '/config/hostlist.conf'],
        volumeMounts: [{
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
        image: 'binhex/arch-delugevpn:2.0.5-1-04',
        env: {
          VPN_ENABLED: 'yes',
          VPN_USER: this.args.pia.user,
          VPN_PASS: this.piaSecret.asEnvValue('password'),
          VPN_PROV: 'pia',
          VPN_CLIENT: 'wireguard',
          STRICT_PORT_FORWARD: 'yes',
          ENABLE_PRIVOXY: 'no',
          LAN_NETWORK: '192.168.1.0/24', // CIDR notation
          // TODO: Remove nameservers from config
          NAME_SERVERS: '84.200.69.80,37.235.1.174,1.1.1.1,37.235.1.177,84.200.70.40,1.0.0.1',
          DELUGE_DAEMON_LOG_LEVEL: 'error', // <critical|error|warning|info|debug>
          DELUGE_WEB_LOG_LEVEL: 'error', // <critical|error|warning|info|debug>
          DEBUG: 'false',
          UMASK: '022', // 0755
          PUID: '1000', // erik on hades
          PGID: '1001', // erik on hades
        },
        ports: {
          http: 8112,
          // privoxy: 8118,
          daemon: 58846,
          // incoming: 58946,
        },
        volumeMounts: [
          this.configPvc.mount('/config'),
          { name: 'downloads',  mountPath: '/data' },
        ],
      }],
    });
  
    this.deployment = new kx.Deployment(this.getName('deluge'), {
      metadata: {
        name: this.getName('deluge'),
        namespace: this.args.namespace,
      },
      spec: pb.asDeploymentSpec({
        strategy: { type: 'Recreate' },
      }),
    }, { parent: this });
  
    this.service = new k8s.core.v1.Service(this.getName('http'), {
      metadata: {
        name: this.getName('deluge'),
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

    this.ingressRoute = new traefik.IngressRoute(this.getName(), {
      metadata: { name: this.getName(), namespace: args.namespace },
      spec: {
        entryPoints: ['websecure'],
        routes: [{
          kind: 'Rule',
          match: 'Host(`deluge.int.unmango.net`)',
          services: [{
            name: this.service.metadata.name,
            port: this.service.spec.ports[0].port,
          }],
        }],
      },
    }, { parent: this });

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

export interface PiaConfig {
  user: string;
  password: string;
}

export interface DelugeArgs {
  deluge: DelugeConfig;
  namespace: Input<string>;
  pia: PiaConfig;
  projectId: Input<string>;
  storage: Input<{
    accessModes: Input<string>[];
    class: Input<string>;
    size: Input<string>;
  }>;
}
