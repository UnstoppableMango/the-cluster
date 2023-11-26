import { Config } from '@pulumi/pulumi';
import { CsiConfig, Rbd, CephFS } from './types';

const config = new Config();
export const clusterId = 'f0f64d5b-8883-4b81-8603-680073516d79';

export const csi: CsiConfig = [{
  clusterID: clusterId,
  monitors: [
    'v2:192.168.1.12:3300/0,v1:192.168.1.12:6789/0',
    'v2:192.168.1.10:3300/0,v1:192.168.1.10:6789/0',
  ],
}];

export const rbd = config.requireObject<Rbd>('rbd');
export const cephfs = config.requireObject<CephFS>('cephfs');
