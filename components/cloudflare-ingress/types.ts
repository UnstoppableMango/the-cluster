import { Input } from '@pulumi/pulumi';

export interface CloudflareTunnelIngressControllerArgs {
  /**
   * The name to use for the created token.
   */
  apiTokenName: Input<string>;

  /**
   * Whether this should be the default ingress class.
   */
  defaultClass: Input<boolean>;

  /**
   * The name of the ingress class to create.
   */
  ingressClassName: Input<string>;

  /**
   * The namespace to deploy resources to.
   */
  namespace: Input<string>;

  /**
   * The version of the helm chart to deploy.
   */
  version: Input<string>;

  /**
   * The CloudFlare zone to create tunnels in.
   */
  zone: Input<string>;
}
