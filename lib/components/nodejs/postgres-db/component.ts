import { Database, Grant, Role } from '@pulumi/postgresql';
import { ComponentResource, ComponentResourceOptions } from '@pulumi/pulumi';
import { RandomPassword } from '@pulumi/random';
import * as lib from '@unstoppablemango/thecluster/dbs/postgres';
import { PostgresDatabaseArgs } from './types';

export class PostgresDatabase extends ComponentResource {
	public readonly ownerPassword: RandomPassword;
	public readonly owner: Role;
	public readonly database: Database;
	public readonly allDbPermissions: Grant;

	constructor(name: string, args?: PostgresDatabaseArgs, opts?: ComponentResourceOptions) {
		super('thecluster:index:PostgresDatabase', name, args, opts);

		const ownerPassword = new RandomPassword(name, {
			length: 48,
			special: false,
		}, { parent: this });

		const owner = new Role(`${name}_owner`, {
			name: `${name}_owner`,
		}, { parent: this });

		const role = new Role(name, {
			name,
			login: true,
			roles: [owner.name],
			password: ownerPassword.result,
		}, { parent: this });

		const database = new Database(name, {
			name,
			owner: owner.name,
		}, { parent: this, dependsOn: role });

		const allDbPermissions = new Grant('all', {
			objectType: 'database',
			database: database.name,
			privileges: lib.allDbPermissions,
			role: role.name,
		}, { parent: this });

		this.ownerPassword = ownerPassword;
		this.owner = owner;
		this.database = database;
		this.allDbPermissions = allDbPermissions;

		this.registerOutputs({
			ownerPassword,
			owner,
			database,
			allDbPermissions,
		});
	}
}
