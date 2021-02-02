import * as pulumi from '@pulumi/pulumi';
import { MetalLb, Traefik, TraefikConfig } from './resources';

const config = new pulumi.Config();

// const project = new rancher.Project('networking', {
//   name: 'Networking',
//   clusterId: theCluster.id,
// });

const metallb = new MetalLb('metallb', {
  version: '2.2.0',
  addresses: ['192.168.1.75-192.168.1.99'],
});

const traefikConfig = config.requireObject<TraefikConfig>('traefik');

const traefik = new Traefik('traefik', {
  version: '9.14.0',
  pilotToken: traefikConfig.pilot.token,
});
