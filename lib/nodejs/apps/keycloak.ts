import { Input, Output, interpolate, output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/keycloak';
import { Refs } from '../internal';

export interface HostsShape {
  external?: string;
  internal?: string;
  aliases?: {
    external?: string[];
    internal?: string[];
  };
}

function isHostsShape(x: object): x is HostsShape {
  if ("external" in x) return true;
  if ("internal" in x) return true;
  if ("aliases" in x) return true; // Eh... lol

  return false;
}

function hostsRedirectUris(hosts: HostsShape): string[] {
  const results = [];

  if (hosts.external) results.push(hosts.external);
  if (hosts.internal) results.push(hosts.internal);

  if (hosts.aliases?.external) {
    results.push(...hosts.aliases.external);
  }

  if (hosts.aliases?.internal) {
    results.push(...hosts.aliases.internal);
  }

  return results;
}

export function redirectUris(...hosts: (Input<string | Input<string>[]> | HostsShape)[]): Output<Output<string>[]> {
  return output(hosts).apply(h => h
    .flatMap(mhosts => {
      if (typeof mhosts === 'string') {
        return [mhosts];
      } else if (isHostsShape(mhosts)) {
        return hostsRedirectUris(mhosts);
      }

      return mhosts;
    })
    .map(host => {
      if (host.startsWith('http')) {
        if (host.endsWith('/oauth2/callback')) {
          return output(host);
        }

        return interpolate`${host}/oauth2/callback`;
      }

      return interpolate`https://${host}/oauth2/callback`;
    }),
  );
}

export interface Hosts {
  external: Output<string>;
  internal: Output<string>;
}

export class Keycloak {
  private _ref = this._refs.keycloak;
  private _provider: Provider | undefined;
  constructor(private _refs: Refs) { }

  public get hosts(): Output<Hosts> {
    return this._ref.requireOutput('hosts') as Output<Hosts>;
  }

  public get hostname(): Output<string> {
    return this._ref.requireOutput('hostname') as Output<string>;
  }

  public get username(): Output<string> {
    return this._ref.requireOutput('username') as Output<string>;
  }

  public get password(): Output<string> {
    return this._ref.requireOutput('password') as Output<string>;
  }

  public get provider(): Provider {
    if (!this._provider) {
      this._provider = new Provider('keycloak', {
        url: interpolate`https://${this.hosts.external}`,
        username: 'admin',
        password: this.password,
        clientId: 'admin-cli',
      });
    }

    return this._provider;
  }
}
