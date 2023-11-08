import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as path from 'path';

interface Versions {
  uefi: string;
}

const config = new pulumi.Config();
const versions = config.requireObject<Versions>('versions');
const stack = pulumi.getStack();
const metallbStack = new pulumi.StackReference('metallb', {
  name: `UnstoppableMango/thecluster-metallb/${stack}`,
});

const core = new k8s.yaml.ConfigFile('core', {
  file: path.join('manifests', stack, 'cluster-api-core', 'output.yaml'),
}, {
  // Would be nice to find a way to ignore just the aggregated manager role rules, not all rules
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
    'rules', // Aggregated ClusterRole will get rules filled in by controlplane
  ],
});

const bootstrap = new k8s.yaml.ConfigGroup('bootstrap', {
  files: path.join('manifests', stack, 'talos-bootstrap', 'output.yaml'),
  transformations: [patchControllerManagerPorts],
}, {
  dependsOn: core.ready,
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});

const controlplane = new k8s.yaml.ConfigGroup('controlplane', {
  files: path.join('manifests', stack, 'talos-control-plane', 'output.yaml'),
  transformations: [patchControllerManagerPorts],
}, { dependsOn: bootstrap.ready });

const infrastructure = new k8s.yaml.ConfigGroup('infrastructure', {
  files: [
    'sidero-infrastructure',
    'proxmox-infrastructure',
  ].map(x => path.join('manifests', stack, x, 'output.yaml')),
  transformations: [patchSideroManager, patchProxmoxService],
}, {
  dependsOn: controlplane.ready,
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});

const sideroLb = new k8s.core.v1.Service('siderolb', {
  metadata: {
    name: 'siderolb',
    namespace: 'sidero-system'
  },
  spec: {
    type: k8s.types.enums.core.v1.ServiceSpecType.LoadBalancer,
    loadBalancerClass: metallbStack.requireOutput('loadBalancerClass'),
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
}, { dependsOn: infrastructure.ready });

function patchControllerManagerPorts(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Deployment') return;

  const deployments = ['cabpt-controller-manager', 'cacppt-controller-manager'];

  if (!deployments.includes(obj.metadata.name)) return;

  // Seems to be a bug in the templates. Metrics binds to 8080, but there is no corresponding port
  obj.spec.template.spec.containers[0].ports.push({
    containerPort: 8080,
    name: 'https',
    protocol: 'TCP',
  });
}

function patchProxmoxService(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Service') return;
  const names = [
    'cluster-api-provider-proxmox-controller-manager-metrics-service',
    'cappx-controller-manager-metrics-service',
  ];
  if (!names.includes(obj.metadata.name)) return;

  obj.metadata.labels['control-plane'] = 'cappx-controller-manager';
  obj.spec.selector['control-plane'] = 'cappx-controller-manager';
  obj.spec.selector['cluster.x-k8s.io/aggregate-to-manager'] = undefined
}

function patchSideroManager(obj: any, opts: pulumi.CustomResourceOptions): void {
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
