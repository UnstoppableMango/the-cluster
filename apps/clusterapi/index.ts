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
  transformations: [patchSideroManager, patchProxmoxService, patchSideroServices],
}, {
  dependsOn: controlplane.ready,
  ignoreChanges: [
    'spec.conversion.webhook.clientConfig.caBundle', // cert-manager injects `caBundle`s
  ],
});

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
  if (obj.metadata.name !== 'cluster-api-provider-proxmox-controller-manager-metrics-service') return;

  obj.metadata.labels['control-plane'] = 'capp-controller-manager';
  obj.spec.selector['control-plane'] = 'capp-controller-manager';
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

function patchSideroServices(obj: any, opts: pulumi.CustomResourceOptions): void {
  if (obj.kind !== 'Service') return;
  const services = ['sidero-dhcp', 'sidero-tftp', 'sidero-siderolink', 'sidero-http'];
  if (!services.includes(obj.metadata.name)) return;

  if (!obj.metadata.annotations) obj.metadata.annotations = {};
  obj.metadata.annotations['metallb.universe.tf/address-pool'] = metallbStack.requireOutput('sideroPoolName');
  obj.spec.type = 'LoadBalancer';
}
