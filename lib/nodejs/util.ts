export function appendIf(x: string, o?: string | undefined | null): string {
  return o ? x + o : x;
}
