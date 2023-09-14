import * as pulumi from "@pulumi/pulumi";
import * as command from '@pulumi/command';

const config = new pulumi.Config();

let dockerCluster: command.local.Command | null = null;
if (config.getBoolean('useDocker')) {
  dockerCluster = new command.local.Command('create-cluster', {
    create: './scripts/create-cluster.sh',
    delete: './scripts/destroy-cluster.sh',
  });
}
