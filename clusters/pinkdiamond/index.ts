import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as cloudflare from '@pulumi/cloudflare';
import * as talos from '@pulumiverse/talos';
import { Node, Versions } from './types';

const templatesRef = new pulumi.StackReference('templates', {
  name: 'UnstoppableMango/thecluster-capi-templates/rosequartz',
});

const config = new pulumi.Config();
const controlPlaneConfig = config.requireObject<Node[]>('controlPlanes');
const workerConfig = config.requireObject<Node[]>('workers');
const versions = config.requireObject<Versions>('versions');

// TODO: Tunnel
// const publicEndpoint = new cloudflare.Record('pd.thecluster.io', {
//   name: 'pd.thecluster.io',
//   type: 'A',
//   zoneId: config.require('zoneId'),
//   proxied: false,
//   value: config.requireSecret('publicIp'),
// });

// Subject Alternative Names to use for certificates
const certSans = [
  // // The first in the array seems to get ignored for some reason, so we add it twice
  // config.require('localIp'),
  config.require('localIp'),
  config.require('primaryDnsName'),
  config.require('vip'),
];

const controlPlaneTemplate = templatesRef.requireOutput('rp4.md') as pulumi.Output<infra.v1alpha3.MetalMachineTemplate>;

