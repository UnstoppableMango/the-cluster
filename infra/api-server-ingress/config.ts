import { Config, getStack } from '@pulumi/pulumi';
import { StackReference } from '@pulumi/pulumi/stackReference';
import * as cluster from '@unstoppablemango/thecluster/cluster';

const config = new Config();
export const clusterName = 'rosequartz';
export const ref = cluster.ref(clusterName, 'prod');
export const provider = cluster.provider(ref, clusterName);

const tunnelsRef = new StackReference('tunnels', {
  name: `UnstoppableMango/thecluster-cloudflare-tunnels/${getStack()}`,
});

export const theclusterIoTunnelName = tunnelsRef.requireOutput('theclusterIoTunnelName');
