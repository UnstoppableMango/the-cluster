import * as kx from '@pulumi/kubernetesx';
import { ComponentResource, ComponentResourceOptions, Input, Output } from '@pulumi/pulumi';
import { Pia } from './pia';

export class Deluge extends ComponentResource {

  private readonly _opts = { parent: this };
  private readonly _k8sProvider = this.opts?.provider;
  private readonly _k8sOpts = { ...this._opts, provider: this._k8sProvider };

  public readonly config = new kx.PersistentVolumeClaim(this.getName('config'), {
    metadata: { namespace: this.args.namespace },
    spec: {
      storageClassName: 'longhorn',
      accessModes: ['ReadWriteOnce'],
      resources: { requests: { storage: '1Gi' } },
    },
  }, this._k8sOpts);

  public readonly auth = new kx.Secret(this.getName('auth'), {
    metadata: { namespace: this.args.namespace },
    stringData: { auth: this.getAuthValue() },
  }, this._k8sOpts);

  public readonly env = new kx.ConfigMap(this.getName('deluge'), {
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
  }, this._k8sOpts);

  public readonly piaSecret = new kx.Secret(this.getName('pia'), {
    metadata: { namespace: this.args.namespace },
    stringData: { password: this.args.pia.password },
  }, this._k8sOpts);

  public readonly downloads = new kx.PersistentVolumeClaim(this.getName('downloads'), {
    metadata: { namespace: this.args.namespace },
    spec: {
      accessModes: ['ReadWriteMany'],
      resources: { requests: { storage: '1000Gi' } },
      storageClassName: 'nfs-client',
    },
  }, this._k8sOpts);

  private readonly _pb = new kx.PodBuilder({
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
      image: 'busybox',
      command: ['cp', '/auth', '/config/auth'],
      volumeMounts: [{
        name: this.getName('auth'),
        mountPath: '/auth',
        subPath: 'auth',
      }, {
        name: this.config.metadata.name,
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
      image: 'binhex/arch-delugevpn:2.0.4.dev38_g23a48dd01-3-01',
      envFrom: [{ configMapRef: { name: this.env.metadata.name } }],
      env: {
        VPN_PASS: this.piaSecret.asEnvValue('password'),
      },
      ports: {
        http: 8112,
        // privoxy: 8118,
        daemon: 58846,
        daemon2: 58946,
      },
      volumeMounts: [
        this.config.mount('/config'),
        this.downloads.mount('/data'),
      ],
    }],
  });

  public readonly deployment = new kx.Deployment(this.getName('deluge'), {
    metadata: { namespace: this.args.namespace },
    spec: this._pb.asDeploymentSpec(),
  }, this._k8sOpts);

  public readonly service = this.deployment.createService({
    type: kx.types.ServiceType.LoadBalancer,
    ports: [
      { name: 'http', port: 8112, targetPort: 8112 },
      // { name: 'privoxy', port: 8118, targetPort: 8118 },
      { name: 'daemon', port: 58846, targetPort: 58846 },
      { name: 'daemon2', port: 58946, targetPort: 58946 },
    ],
  });

  constructor(private name: string, private args: DelugeArgs, private opts?: ComponentResourceOptions) {
    super('unmango:apps:deluge', name, undefined, opts);
  }

  private getAuthValue(): Output<string> {
    const { username, password } = this.args.deluge;
    return Output.create(`${username}:${password}:${Permissions.Admin}\n`);
  }

  private getName(name?: string): string {
    return [...new Set(['deluge', this.name, name])]
      .filter(x => !!x)
      .join('-');
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
