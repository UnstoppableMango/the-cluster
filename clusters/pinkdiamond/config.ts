import { Config, StackReference, getStack } from '@pulumi/pulumi';

export interface Versions {
  k8s: string,
  talos: string,
  ksca: string,
}

export interface Node {
  ip: string;
  hostname?: string;
  installDisk: string;
  qemu?: boolean;
}

export const config = new Config();
export const stack = getStack();

const caRef = new StackReference('ca', {
  name: `UnstoppableMango/thecluster-ca/${config.require('caStack')}`,
});

export const caPem = caRef.requireOutput('caPem');
export const keyPem = caRef.requireOutput('keyPem');
export const validityPeriodHours = 25 * 365 * 24; // Intent: 25 years
export const earlyRenewalHours = 7 * 24; // Intent: 1 week cuz I'll probably forget
