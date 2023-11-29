import { ComponentResource, ComponentResourceOptions, Input, Inputs, interpolate, output } from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

export interface Values {
  namespaceOverride?: Input<string>;
  kubeVersion?: Input<string>;
  config?: Input<{
    annotations?: Inputs;
    clientID?: Input<string>;
    clientSecret?: Input<string>;
    cookieSecret?: Input<string>;
    cookieName?: Input<string>;
    google?: Input<{
      adminEmail: Input<string>;
      useApplicationDefaultCredentials: Input<boolean>;
      targetPrinciple: Input<string>;
      serviceAccountJson: Input<string>;
    } | {
      existingSecret: Input<string>;
      groups: Input<Input<string>[]>;
    }>;
    configFile?: Input<string>;
    existingConfig?: Input<string>;
  }>;
  alphaConfig?: Input<{
    enabled?: Input<boolean>;
    annotations?: Inputs;
    serverConfigData?: Inputs;
    metricsConfigData?: Inputs;
    configData?: Inputs;
    configFile?: Input<string>;
    existingConfig?: Input<string>;
    existingSecret?: Input<string>;
  }>;
  image?: Input<{
    repository?: Input<string>;
    tag?: Input<string>;
    pullPolicy?: Input<string>;
  }>;
  imagePullSecrets?: Input<Input<{
    name: Input<string>;
  }>[]>;
  containerPort?: Input<number>;
  extraArgs?: Inputs;
  extraEnv?: Input<Input<{
    name: Input<string>;
    value: Input<string>;
  }>[]>;
  customLabels?: Inputs;
  authenticatedEmailsFile?: Input<{
    enabled?: Input<boolean>;
    persistence?: Input<'configmap' | 'secret'>;
    template?: Input<string>;
    restrictedUserAccessKey?: Input<string>;
    restricted_access?: Input<string>;
    annotations?: Inputs;
  }>;
  service?: Input<{
    type?: Input<string>;
    portNumber?: Input<number>;
    appProtocol?: Input<string>;
    annotations?: Inputs;
  }>;
  serviceAccount?: Input<{
    enabled?: Input<boolean>;
    name?: Input<string>;
    automountServiceAccountToken?: Input<boolean>;
    annotations?: Inputs;
  }>;
  ingress?: Input<{
    enabled?: Input<boolean>;
    className?: Input<string>;
    path?: Input<string>;
    pathType?: Input<string>;
    hosts?: Input<Input<string>[]>;
    extraPaths?: Input<Input<{
      path?: Input<string>;
      pathType?: Input<string>;
      backend: Input<{
        service: Input<{
          name: Input<string>;
          port: Input<{
            name: Input<string>;
          }>;
        }>;
      }>;
    }>[]>;
    labels?: Inputs;
    annotations?: Inputs;
    tls?: Input<Input<{
      secretName: Input<string>;
      hosts: Input<Input<string>[]>;
    }>[]>;
  }>;
  resources?: Input<{
    limits?: Input<{
      cpu?: Input<string>;
      memory?: Input<string>;
    }>;
    requests?: Input<{
      cpu?: Input<string>;
      memory?: Input<string>;
    }>;
  }>;
  priorityClassName?: Input<string>;
  hostAlias?: Input<{
    enabled: Input<boolean>;
    ip?: Input<string>;
    hostname?: Input<string>;
  }>;
  affinity?: Inputs;
  tolerations?: Input<Inputs[]>;
  nodeSelector?: Inputs;
  proxyVarsAsSecrets?: Input<boolean>;
  replicaCount?: Input<number>;
  httpScheme?: Input<'http' | 'https'>;
  initContainers?: Input<{
    waitForRedis?: Input<{
      enabled: Input<boolean>;
      image?: Input<{
        repository?: Input<string>;
        pullPolicy?: Input<string>;
      }>;
      kubectlVersion?: Input<string>;
      securityContext?: Input<{
        enabled?: Input<boolean>;
      }>;
    }>;
  }>;
  sesstionStorage?: Input<{
    type?: Input<'cookie' | 'redis'>;
    redis?: Input<{
      existingSecret?: Input<string>;
      password?: Input<string>;
      passwordKey?: Input<string>;
      clientType?: Input<'standalone' | 'cluster' | 'sentinel'>;
      standalone?: Input<{
        connectionUrl?: Input<string>;
      }>;
      cluster?: Input<{
        connectionUrls?: Input<Input<string>[]>;
      }>;
      sentinel?: Input<{
        existingSecret?: Input<string>;
        password?: Input<string>;
        passwordKey?: Input<string>;
        masterName?: Input<string>;
        connectionUrls?: Input<Input<string>[]>;
      }>;
    }>;
  }>;
  redis?: Input<{
    enabled?: Input<boolean>;
    redisPort?: Input<number>;
    cluster?: Input<{
      enabled: Input<boolean>;
      slaveCount?: Input<number>;
    }>;
  }>;
  checkDeprecation?: Input<boolean>;
}

export interface Oauth2ProxyArgs {
  namespace?: Input<string>;
  redirectUrl?: Input<string>;
  version?: Input<string>;
  values?: Input<Values>;
  transformations?: k8s.helm.v3.ChartOpts['transformations'];
  realm: Input<string>;
  hostname: Input<string>;
  clientId: Input<string>;
  clientSecret: Input<string>;
}

export class Oauth2Proxy extends ComponentResource {
  public readonly chart: k8s.helm.v3.Chart;

  constructor(name: string, args: Oauth2ProxyArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:Oauth2Proxy', name, args, opts);

    const values = output(args.values).apply((x): Values => ({
      ...x,
      config: {
        ...x?.config,
        clientID: args.clientId,
        clientSecret: args.clientSecret,
      },
      extraEnv: [
        ...(x?.extraEnv ?? []),
        { name: 'OAUTH2_PROXY_PROVIDER', value: 'keycloak-oidc' },
        { name: 'OAUTH2_PROXY_REDIRECT_URL', value: interpolate`https://${args.hostname}/oauth2/callback` },
        { name: 'OAUTH2_PROXY_OIDC_ISSUER_URL', value: interpolate`https://auth2.thecluster.io/realms/${args.realm}` },
        // { name: 'OAUTH2_PROXY_CODE_CHALLENGE_METHOD', value: 'S256' },
        // { name: 'OAUTH2_PROXY_HTTP_ADDRESS', value: '0.0.0.0:4180' },
        { name: 'QAUTH2_PROXY_ERRORS_TO_INFO_LOG', value: 'true' },
      ],
      ingress: {
        ...x?.ingress,
        enabled: true,
        className: x?.ingress?.className ?? 'cloudflare-ingress',
        path: 'Prefix',
        hosts: output(args.values).apply(x => x?.ingress?.hosts ?? [args.hostname]),
        annotations: {
          'cloudflare-tunnel-ingress-controller.strrl.dev/backend-protocol': 'http',

          // * Ingress .status.loadBalancer field was not updated with a hostname/IP address.
          // for more information about this error, see https://pulumi.io/xdv72s
          // https://github.com/pulumi/pulumi-kubernetes/issues/1812
          // https://github.com/pulumi/pulumi-kubernetes/issues/1810
          'pulumi.com/skipAwait': 'true',
        },
      },
    }));

    const chart = new k8s.helm.v3.Chart(name, {
      repo: 'https://oauth2-proxy.github.io/manifests',
      chart: 'oauth2-proxy',
      namespace: args.namespace,
      version: args.version,
      values,
      transformations: args.transformations,
    }, {
      parent: this,
    });

    this.chart = chart;

    this.registerOutputs({
      chart,
    });
  }

}
