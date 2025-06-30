import { Input, Inputs, Output, output, UnwrappedObject } from '@pulumi/pulumi';
import * as YAML from 'yaml';
import { HostsShape } from '../apps/keycloak';

export function appendIf(x: string, o?: string | undefined | null): string {
	return o ? x + o : x;
}

export function range(size: number, start: number = 0): ReadonlyArray<number> {
	return [...Array(size).keys()].map(i => i + start);
}

export function required(x: string | undefined): string {
	if (x === null || x === undefined) {
		throw new Error(`value was requried but was '${x}'`);
	}
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

export function concat(x: Input<Input<string>[]>): Output<string> {
	return output(x).apply(y => y.reduce((p, c) => p + c));
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

export function b64encode(value: string): string {
	return Buffer.from(value).toString('base64');
}

export function b64decode(value: string): string {
	return Buffer.from(value, 'base64').toString('utf-8');
}

export class Lazy<T> {
	private _instance?: T;
	constructor(private _factory: () => T) {}

	public get value(): T {
		return this.get();
	}

	public get(): T {
		if (!this._instance) {
			this._instance = this._factory();
		}

		return this._instance;
	}
}

export class LazyMap<T, V = any> {
	private _items = new Map<string, T>();
	private _factories: Map<string, (key: string) => T>;

	constructor(factories: [string, (key: string) => T][], private _bindee?: V) {
		this._factories = new Map(factories);
	}

	public get(key: string): T {
		let res = this._items.get(key);
		if (!res) {
			let fac = this._factories.get(key);
			if (!fac) throw new Error(`No factory registered for ${key}`);
			if (this._bindee) fac = fac.bind(this._bindee);
			res = fac(key);
			this._items.set(key, res);
		}
		return res;
	}
}

export function allHosts(hosts: HostsShape): string[] {
	if (typeof hosts === 'string') return [hosts];
	if (Array.isArray(hosts)) return hosts;
	return [
		hosts.external,
		hosts.internal,
		...(hosts.aliases?.external ?? []),
		...(hosts.aliases?.internal ?? []),
	].filter(x => x).map(x => x ?? '');
}
