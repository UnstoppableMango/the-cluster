export function toKebabCase(...src: string[]): string {
  return src
    .flatMap(x => x.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? [x])
    .map(x => x.toLowerCase())
    .join('-');
}

// https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
export const flatten = (data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  const recurse = (cur: Record<string, unknown>, prop: string) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      // eslint-disable-next-line prefer-const
      let l = 0;
      for (let i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + '[' + i + ']');
      if (l == 0)
        result[prop] = [];
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop)
        result[prop] = {};
    }
  };
  recurse(data, '');
  return result;
};

export function pluck<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: any = {};
  for (const key of keys) {
    ret[key] = obj[key];
  }
  return ret;
}

export function getNameResolver(baseName: string, resourceName: string): (name?: string) => string {
  return (name?: string) => {
    return [...new Set([baseName, resourceName, name])]
      .filter(x => !!x)
      .join('-');
  };
}
