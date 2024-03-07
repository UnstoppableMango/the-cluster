import { ComponentResource, ComponentResourceOptions, interpolate, output } from '@pulumi/pulumi';
import { KubeadmArgs } from './types';

export class Kubeadm extends ComponentResource {
  public readonly chart: Chart;

  constructor(name: string, args: KubeadmArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:Kubeadm', name, args, opts);

    this.chart = chart;

    this.registerOutputs({ chart });
  }
}
