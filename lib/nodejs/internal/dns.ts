import * as pi from '@unmango/pulumi-pihole';
import { Apps } from './apps';

export interface PiHole {
	provider: pi.Provider;
}

export class Dns {
	constructor(private _apps: Apps) {}

	public get pihole(): PiHole {
		return { provider: this._apps.pihole.provider };
	}
}
