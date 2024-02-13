import { CustomResourceOptions, output } from '@pulumi/pulumi';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Service, ServiceSpecType } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { IPAddressPool, L2Advertisement } from '@unstoppablemango/thecluster-crds/metallb/v1beta1';
import { versions } from './config';

const chart = new Chart('sidero', {
  path: './',
  transformations: [patchSideroManager, ignoreMetricsSvc],
}, { provider });

const ns = chart.getResource('v1/Namespace', 'sidero-system');

const pool = new IPAddressPool('sidero', {
  metadata: {
    name: 'sidero',
    namespace: 'metallb-system',
  },
  spec: {
    addresses: ['192.168.1.98/32'],
    autoAssign: true,
    avoidBuggyIPs: true,
    serviceAllocation: {
      namespaces: [ns.metadata.name],
    },
  },
}, { provider });

const advertisement = new L2Advertisement('sidero', {
  metadata: {
    name: 'sidero',
    namespace: 'metallb-system',
  },
  spec: {
    ipAddressPools: [output(pool.metadata).apply(x => x?.name ?? '')],
  },
}, { provider });

const sideroLb = new Service('siderolb', {
  metadata: {
    name: 'siderolb',
    namespace: ns.metadata.name,
  },
  spec: {
    type: ServiceSpecType.LoadBalancer,
    loadBalancerIP: '192.168.1.98',
    ports: [{
      name: 'dhcp',
      port: 67,
      protocol: 'UDP',
      targetPort: 'dhcp',
    }, {
      name: 'http',
      port: 8081,
      protocol: 'TCP',
      targetPort: 'http',
    }, {
      name: 'siderolink',
      port: 51821,
      protocol: 'UDP',
      targetPort: 'siderolink',
    }, {
      name: 'tftp',
      port: 69,
      protocol: 'UDP',
      targetPort: 'tftp',
    }],
    selector: {
      app: 'sidero',
      'cluster.x-k8s.io/provider': 'sidero',
      'cluster.x-k8s.io/v1alpha3': 'v1alpha3',
      'cluster.x-k8s.io/v1alpha4': 'v1alpha3',
      'cluster.x-k8s.io/v1beta1': 'v1alpha3',
      'control-plane': 'sidero-controller-manager',
    },
  },
}, { provider, dependsOn: chart.ready.apply(x => [...x, advertisement]) });

function ignoreMetricsSvc(obj: any, opts: CustomResourceOptions): void {
  const applys = ['sidero-controller-manager-metrics-service', 'caps-controller-manager-metrics-service'];
  if (!applys.includes(obj.metadata.name)) return;
  obj.kind = 'List';
}

function patchSideroManager(obj: any, opts: CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;
  if (obj.metadata.name !== 'sidero-controller-manager') return;

  if (!obj.spec.template.spec.volumes) {
    obj.spec.template.spec.volumes = [];
  }

  obj.spec.template.spec.volumes.push({
    name: 'tftp-folder',
    emptyDir: {},
  });

  if (!obj.spec.template.spec.initContainers) {
    obj.spec.template.spec.initContainers = [];
  }

  obj.spec.template.spec.initContainers.push({
    image: `ghcr.io/unstoppablemango/raspberrypi4-uefi:${versions.uefi}`,
    imagePullPolicy: 'Always',
    name: 'tftp-folder-setup',
    command: ['cp'],
    args: ['-r', '/tftp', '/var/lib/sidero'],
    volumeMounts: [{
      mountPath: '/var/lib/sidero/tftp',
      name: 'tftp-folder',
    }],
  });

  obj.spec.template.spec.containers.find((x: any) => x.name === 'manager').volumeMounts.push({
    mountPath: '/var/lib/sidero/tftp',
    name: 'tftp-folder',
  });
}
