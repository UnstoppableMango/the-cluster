import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const cluster = pulumi.getStack();
const dashRef = new pulumi.StackReference('dashboard', {
  name: `UnstoppableMango/thecluster-dashboard/${cluster}`,
});

const ns = dashRef.requireOutput('namespace');
const serviceName = dashRef.requireOutput('service');
const serviceId = pulumi.interpolate`${ns}/${serviceName}`;
const service = k8s.core.v1.Service.get('dashboard', serviceId);

const serviceIp = service.spec.clusterIP;
const servicePort = service.spec.ports[0].port;
export const host = pulumi.interpolate`https://${serviceIp}:${servicePort}`;
