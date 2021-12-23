import * as traefik from '@pulumi/crds/traefik/v1alpha1';

interface CanBuild {
  build: () => string;
}

interface AddMatcher {
  host: (host: string) => AddOperator;
  path: (path: string) => AddOperator;
  pathPrefix: (path: string) => AddOperator;
}

interface AddOperator extends CanBuild {
  and: () => AddMatcher;
  or: () => AddMatcher;
}

export type MatchBuilder =
  & AddMatcher
  & CanBuild;

class Builder implements MatchBuilder {

  private readonly parts: string[] = [];

  and(): AddMatcher {
    this.parts.push('&&');
    return this;
  }

  build(): string {
    return this.parts.join(' ');
  }

  host(host: string): AddOperator {
    this.parts.push(`Host(\`${host}\`)`);
    return this;
  }

  or(): AddMatcher {
    this.parts.push('||');
    return this;
  }

  path(path: string): AddOperator {
    this.parts.push(`Path(\`${path}\`)`);
    return this;
  }

  pathPrefix(path: string): AddOperator {
    this.parts.push(`PathPrefix(\`${path}\`)`);
    return this;
  }

}

export const matchBuilder = (): MatchBuilder => new Builder();

export type StripPrefixMiddleware = {
  (prefix: string, forceSlash?: boolean): traefik.Middleware
}

export const stripPrefixMiddlewareBuilder = (name: string, namespace: string): StripPrefixMiddleware => {
  return (prefix: string, forceSlash = false) => new traefik.Middleware(name, {
    metadata: {
      name,
      namespace,
    },
    spec: {
      stripPrefix: {
        prefixes: [prefix],
        forceSlash,
      },
    },
  });
};
