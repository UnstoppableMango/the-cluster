import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions, channel } from './config';

const crds = new k8s.yaml.ConfigFile('gateway-api', {
  file: `https://github.com/kubernetes-sigs/gateway-api/releases/download/${versions.gatewayApi}/${channel}-install.yaml`
}, { provider });
