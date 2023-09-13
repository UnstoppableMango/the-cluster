import * as pulumi from "@pulumi/pulumi";
import * as command from '@pulumi/command';

const clusterCreate = new command.local.Command('create-cluster', {
  create: 'talosctl cluster create --wait',
  delete: 'talosctl cluster destroy',
});
