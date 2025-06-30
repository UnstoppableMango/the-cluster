import { Output } from '@pulumi/pulumi';
import { Apps } from './apps';

export class Ingresses {
	constructor(private _apps: Apps) {}

	public get internal(): Output<string> {
		return this._apps.nginxIngress.ingressClasses.internal;
	}

	// public get cluster(): Output<string> {
	//   return this._apps.nginxIngress.ingressClasses.cluster;
	// }

	public get theclusterIo(): Output<string> {
		return this._apps.cloudflareIngress.theclusterIoClassName;
	}

	public get unmangoNet(): Output<string> {
		return this._apps.cloudflareIngress.unmangoNetClassName;
	}
}
