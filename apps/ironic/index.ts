import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { kustomize } from '@pulumi/kubernetes';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';

const ns = new Namespace('ironic', {
  metadata: { name: 'ironic' },
}, { provider });

const bmo = new ConfigMap('ironic-bmo-configmap', {
  metadata: {
    name: 'ironic-bmo-configmap',
    namespace: ns.metadata.name,
  },
  data: {
    // https://book.metal3.io/ironic/ironic_installation#environmental-variables
    HTTP_PORT: '6180',
    PROVISIONING_IP: '',
    CLUSTER_PROVISIONING_IP: '',
    PROVISIONING_INTERFACE: 'eth2',
    CLUSTER_DHCP_RANGE: '',
    DHCP_RANGE: '172.22.0.10,172.22.0.100', // Not in docs
    DEPLOY_KERNEL_URL: 'http://172.22.0.2:6180/images/ironic-python-agent.kernel',
    DEPLOY_RAMDISK_URL: 'http://172.22.0.2:6180/images/ironic-python-agent.initramfs',
    IRONIC_ENDPOINT: 'http://172.22.0.2:6385/v1/',
    IRONIC_INSPECTOR_ENDPOINT: '',
    CACHEURL: 'http://172.22.0.1/images',
    IRONIC_FAST_TRACK: 'true',
    IRONIC_KERNEL_PARAMS: 'console=ttyS0',
    IRONIC_INSPECTOR_VLAN_INTERFACES: 'all',
    IRONIC_BOOT_ISO_SOURCE: '',
    USE_IRONIC_INSPECTOR: 'true', // Not in docs
    IPA_DOWNLOAD_ENABLED: '',
    USE_LOCAL_IPA: '',
    LOCAL_IPA_PATH: '',
    GATEWAY_IP: '',
    DNS_IP: '',
  },
}, { provider });

const htpasswd = new Secret('ironic-htpasswd', {
  metadata: {
    name: 'ironic-htpasswd',
    namespace: ns.metadata.name,
  },
  stringData: {
    IRONIC_HTPASSWD: '',
  },
}, { provider });

const inspectorHtpasswd = new Secret('ironic-inspector-htpasswd', {
  metadata: {
    name: 'ironic-inspector-htpasswd',
    namespace: ns.metadata.name,
  },
  stringData: {
    IRONIC_HTPASSWD: '',
  },
}, { provider });

const authConfig = new Secret('ironic-auth-config', {
  metadata: {
    name: 'ironic-auth-config',
    namespace: ns.metadata.name,
  },
  stringData: {
    'auth-config': '',
  },
}, { provider });

const inspectorAuthConfig = new Secret('ironic-inspector-auth-config', {
  metadata: {
    name: 'ironic-inspector-auth-config',
    namespace: ns.metadata.name,
  },
  stringData: {
    'auth-config': '',
  },
}, { provider });

// https://book.metal3.io/ironic/ironic_installation#installing-with-kustomize
const app = new kustomize.Directory('ironic', {
  directory: './',
}, {
  provider,
  dependsOn: [
    htpasswd,
    inspectorHtpasswd,
    authConfig,
    inspectorAuthConfig,
  ],
});
