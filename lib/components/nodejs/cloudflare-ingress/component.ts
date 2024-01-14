import { ComponentResource, ComponentResourceOptions, output } from '@pulumi/pulumi';
import { ApiToken, getZoneOutput, getApiTokenPermissionGroups } from '@pulumi/cloudflare';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { CloudflareTunnelIngressControllerArgs } from './types';

export class CloudflareTunnelIngressController extends ComponentResource {
  public readonly apiToken: ApiToken;
  public readonly chart: Chart;

  constructor(name: string, args: CloudflareTunnelIngressControllerArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:CloudflareTunnelIngressController', name, args, opts);

    const zone = getZoneOutput({ name: args.zone });
    const all = getApiTokenPermissionGroups();
    const apiToken = new ApiToken(name, {
      name: args.apiTokenName,
      policies: [{
        permissionGroups: all.then(x => [
          x.zone['Zone Read'],
          x.zone['DNS Write'],
          x.account['Argo Tunnel Write'],
        ]),
        resources: output(zone).apply(z => ({
          [`com.cloudflare.api.account.${z.accountId}`]: '*',
          [`com.cloudflare.api.account.zone.${z.zoneId}`]: '*',
        })),
      }],
    }, { parent: this });

    const chart = new Chart(name, {
      chart: 'cloudflare-tunnel-ingress-controller',
      fetchOpts: {
        repo: 'https://helm.strrl.dev/',
        version: args.version,
      },
      namespace: args.namespace,
      values: {
        cloudflare: {
          apiToken: apiToken.value,
          accountId: zone.accountId,
          tunnelName: args.ingressClassName,
        },
        ingressClass: {
          name: args.ingressClassName,
          isDefaultClass: args.defaultClass,
        },
        securityContext: {
          allowPrivilegeEscalation: false,
        },
      },
    }, { parent: this });

    this.apiToken = apiToken;
    this.chart = chart;

    this.registerOutputs({ apiToken, chart });
  }
}
