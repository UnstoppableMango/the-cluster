import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { releaseDefaults } from '@unmango/shared/helm';

export const createPrometheus = (
  name: string,
  namespace: pulumi.Input<string>,
  values: pulumi.Input<PrometheusValues>,
): k8s.helm.v3.Release => new k8s.helm.v3.Release(name, {
  name,
  namespace,
  chart: 'prometheus',
  ...releaseDefaults,
  values
});

export interface ServiceAccountValues {
  create?: pulumi.Input<boolean>;
  name: pulumi.Input<string>;
  annotations?: pulumi.Input<Record<string, any>>;
}

// https://github.com/prometheus-community/helm-charts/blob/main/charts/prometheus/values.yaml
export interface PrometheusValues {
  /**
   * Define serviceAccount names for components. Defaults to component's fully qualified name.
   */
  serviceAccounts?: pulumi.Input<{
    alertmanager?: pulumi.Input<ServiceAccountValues>;
    nodeExporter?: pulumi.Input<ServiceAccountValues>;
    pushgateway?: pulumi.Input<ServiceAccountValues>;
    server?: pulumi.Input<ServiceAccountValues>;
  }>;
  alertmanager?: pulumi.Input<{
    enabled: pulumi.Input<boolean>;
  }>;
}
