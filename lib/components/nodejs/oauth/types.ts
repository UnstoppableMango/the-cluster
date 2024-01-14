import { Input } from '@pulumi/pulumi';

export interface OAuthApplicationArgs {
  name: Input<string>;

  /**
   * The ID of the realm.
   */
  realmId: Input<string>;

  /**
   * The base URL of the application.
   */
  baseUrl: Input<string>;

  /**
   * The hosts for valid redirect URIs.
   */
  hosts: Input<Input<string>[]>;

  enabled?: Input<boolean>;

  clientId?: Input<string>;
}
