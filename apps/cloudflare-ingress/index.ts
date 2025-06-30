import * as k8s from '@pulumi/kubernetes';
import { CloudflareTunnelIngressController } from '@unmango/pulumi-cloudflare-ingress';

const theclusterNs = new k8s.core.v1.Namespace('thecluster-io-ingress', {
	metadata: { name: 'thecluster-io-ingress' },
});

// const unmangoNs = new k8s.core.v1.Namespace('unmango-net-ingress', {
//   metadata: { name: 'unmango-net-ingress' },
// });

const theclusterIo = new CloudflareTunnelIngressController('thecluster.io', {
	namespace: theclusterNs.metadata.name,
	version: '0.0.9',
	ingressClassName: 'thecluster-io',
	apiTokenName: 'THECLUSTER-ingress-thecluster-io',
	defaultClass: true,
	zone: 'thecluster.io',
});

// const unmangoNet = new CloudflareTunnelIngressController('unmango.net', {
//   namespace: unmangoNs.metadata.name,
//   version: '0.0.9',
//   ingressClassName: 'unmango-net',
//   apiTokenName: 'THECLUSTER-ingress-unmango-net',
//   defaultClass: false,
//   zone: 'unmango.net',
// });

export const theclusterIoClassName = 'thecluster-io';
export const unmangoNetClassName = 'unmango-net';
