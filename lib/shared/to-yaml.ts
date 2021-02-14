import { Input, Output } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import * as yaml from 'yaml';

export function toYaml(obj: Input<Record<string, Input<unknown>>>): Output<string> {
  return pulumi.output(obj).apply(yaml.stringify);
}
