import * as k8s from '@pulumi/kubernetes';
import * as kx from '@pulumi/kubernetesx';
import * as rancher from '@pulumi/rancher2';
import { Heimdall } from './resources';

const project = new rancher.Project('management', {
  name: 'Management',
  clusterId: 'local',
});

const portainerNamespace = new rancher.Namespace('portainer', {
  name: 'portainer',
  projectId: project.id,
});

const portainerRelease = new k8s.helm.v3.Release('portainer', {
  name: 'portainer',
  chart: 'portainer',
  namespace: portainerNamespace.name,
  repositoryOpts: {
    repo: 'https://portainer.github.io/k8s',
  },
  values: {
    service: { type: 'ClusterIP' },
    ingress: {
      enabled: true,
      hosts: [{
        host: 'portainer.int.unmango.net',
        // Needs at least one array item, but keep the defaults on said item
        // https://github.com/portainer/k8s/blob/master/charts/portainer/templates/ingress.yaml#L34-L39
        paths: [{}],
      }],
    },
    persistence: {
      enabled: true,
      size: '5Gi',
      storageClass: 'longhorn',
    },
  },
});

const heimdall = new Heimdall('heimdall', {
  projectId: project.id,
  hostname: 'heimdall.int.unmango.net',
  titlebarText: 'Test',
});

const heimdallExternal = new Heimdall('heimdall-ext', {
  projectId: project.id,
  hostname: 'thecluster.io',
  tlsStore: 'thecluster-io',
});
