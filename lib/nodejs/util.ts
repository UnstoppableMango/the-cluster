import { Input, Output } from '@pulumi/pulumi';

export function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}

export function required(x: string | undefined): string {
  return x ?? '';
}
