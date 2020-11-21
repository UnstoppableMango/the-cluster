export function toKebabCase(...src: string[]): string {
  return src
    .flatMap(x => x.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? [x])
    .map(x => x.toLowerCase())
    .join('-');
}
