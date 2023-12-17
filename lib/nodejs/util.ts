import { Input, Inputs, Output, UnwrappedObject, output } from '@pulumi/pulumi';
import * as YAML from 'yaml';

export function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

export function range(size: number, start: number = 0): ReadonlyArray<number> {
  return [...Array(size).keys()].map(i => i + start);
}

export function required(x: string | undefined): string {
  if (x === null || x === undefined)
    throw new Error(`value was requried but was '${x}'`);
  return x;
}

// export function requireProp<
//   T extends UnwrappedObject<Record<string, R>>,
//   R = unknown,
//   P extends keyof T = keyof T,
// >(prop: P): (x?: T) => R {
//   return x => {
//     if (!x) throw new Error(`Field ${String(prop)} is required`);
//     return x[prop];
//   }
// }

// const test = requireProp<{test:string}>('test');

export function requireNested<T>(selector: (x: T) => string): (x?: T) => string {
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
