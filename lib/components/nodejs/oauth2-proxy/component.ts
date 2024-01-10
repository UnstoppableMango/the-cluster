import { ComponentResource, ComponentResourceOptions, interpolate, output } from '@pulumi/pulumi';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Oauth2ProxyArgs, Values } from './types';

export class Oauth2Proxy extends ComponentResource {
  public readonly chart: Chart;

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

    const chart = new Chart(name, {
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

    this.registerOutputs({ chart });
  }
}
