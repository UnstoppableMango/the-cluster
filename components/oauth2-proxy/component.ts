import { ComponentResource, ComponentResourceOptions, Input, Inputs } from '@pulumi/pulumi';
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
  extraEnv?: Input<Inputs[]>;
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
  replicaCount: Input<number>;
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
  redirectUrl: Input<string>;
  values?: Input<Values>;
}

export class Oauth2Proxy extends ComponentResource {
  public readonly chart: k8s.helm.v3.Chart;

  constructor(name: string, args: Oauth2ProxyArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:Oauth2Proxy', name, args, opts);

    this.chart = new k8s.helm.v3.Chart(name, {
      chart: '',
      values: args.values,
    }, {
      parent: this,
    });

    this.registerOutputs();
  }

}
