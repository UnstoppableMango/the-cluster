import * as pulumi from '@pulumi/pulumi';
import * as pg from '@pulumi/postgresql';
import { provider, credentials } from '@unmango/thecluster/apps/postgresql';
import { requireProp } from '@unmango/thecluster';

export const user = pulumi.output(credentials)
  .apply(x => x.find(y => y.username === 'drone'));

const droneOwner = new pg.Role('drone_owner', {
  name: 'drone_owner',
}, { provider });

const drone = new pg.Role('drone', {
  name: user.apply(requireProp(x => x.username)),
  login: true,
  password: user.apply(requireProp(x => x.password)),
  roles: [droneOwner.name],
}, { provider });

const db = new pg.Database('drone', {
  name: 'drone',
  owner: droneOwner.name,
}, { provider });

export const database = db.name;
