export function differentHostsAffinity(appName: string): { affinity: Affinity } {
  return {
    affinity: {
      podAntiAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: [{
          topologyKey: 'host',
          labelSelector: {
            matchExpressions: [{
              key: 'app',
              operator: 'In',
              values: [appName],
            }],
          },
        }],
      },
    },
  };
}

interface MatchExpression {
  key: string;
  operator: 'In';
  values: string[];
}

interface LabelSelector {
  labelSelector: {
    matchExpressions: MatchExpression[];
  };
  topologyKey: string;
}

export interface Affinity {
  podAntiAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution: LabelSelector[];
  };
  podAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution: LabelSelector[];
  };
}
