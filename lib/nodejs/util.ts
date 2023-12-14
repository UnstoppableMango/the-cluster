import { Input, Inputs, Output, output } from '@pulumi/pulumi';
import * as YAML from 'yaml';

export function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

export function required(x: string | undefined): string {
  return x ?? '';
}

export function requireProp<T>(selector: (x: T) => string): (x?: T) => string {
  return x => x ? selector(x) : '';
}

export function join(x: Input<Input<string>[]>, sep: string): Output<string> {
  return output(x).apply(y => y.join(sep));
}

export function jsonStringify(obj: Inputs): Output<string> {
  return output(obj).apply(x => JSON.stringify(x));
}

export function yamlStringify(obj: Inputs): Output<string> {
  return output(obj).apply(x => YAML.stringify(x));

}
