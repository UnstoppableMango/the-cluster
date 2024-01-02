import { interpolate } from '@pulumi/pulumi';
import { ConfigMap } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Certificate } from '@unstoppablemango/thecluster-crds/certmanager/v1';
import { apps, clusterIssuers, provider, shared } from '@unstoppablemango/thecluster/cluster/from-stack';
import { ip, versions, internalClass } from './config';

const nginxClass = 'nginx';

const cert = new Certificate('lan-thecluster-io', {
  metadata: {
    name: 'lan-thecluster-io',
    namespace: shared.namespaces.nginxIngress,
  },
  spec: {
    secretName: 'lan-thecluster-io',
    issuerRef: clusterIssuers.ref(x => x.root),
    commonName: 'lan.thecluster.io',
    usages: [
      'digital signature',
      'key encipherment',
      'data encipherment',
      'key agreement',
      'cert sign',
    ],
    ipAddresses: [ip],
    dnsNames: [
      'lan.thecluster.io',
      '*.lan.thecluster.io',
      '${POD_NAME}.${POD_NAMESPACE}.svc.cluster.local',
    ],
    uris: [
      'postgres://lan.thecluster.io',
      'postgres://pg.lan.thecluster.io',
      'postgres://postgres.lan.thecluster.io',
    ],
  },
}, { provider });

const config = new ConfigMap('nginx-config', {
  metadata: {
    name: 'nginx-config',
    namespace: shared.namespaces.nginxIngress,
  },
  data: {
    'client-max-body-size': '0',
  },
}, { provider });

const chart = new Chart('nginx-ingress', {
  path: './',
  namespace: shared.namespaces.nginxIngress,
  skipCRDRendering: false,
  values: {
    'nginx-ingress': {
      controller: {
        customConfigMap: config.metadata.name,
        image: {
          pullPolicy: 'IfNotPresent',
          repository: 'nginx/nginx-ingress',
          tag: interpolate`${versions.nginxIngress}-ubi`,
        },
        name: 'internal-nginx',
        kind: 'daemonset',
        ingressClass: {
          name: internalClass,
          setAsDefaultIngress: false, // Consider in the future
        },
        // Lol poor
        nginxplus: false,
        enableCustomResources: true,
        enableOIDC: true,
        enableTLSPassthrough: true,
        tlsPassThroughPort: 443,
        enableCertManager: true,
        enableExternalDNS: true,
        healthStatus: true,
        hostnetwork: false,
        enableSnippets: true,
        defaultTLS: {
          secret: interpolate`${shared.namespaces.nginxIngress}/${cert.spec.apply(x => x?.secretName)}`,
        },
        service: {
          type: 'LoadBalancer',
          loadBalancerIP: ip,
          annotations: {
            'metallb.universe.tf/address-pool': apps.metallb.pool,
          },
        },
        nginxServiceMesh: {
          // Could be useful when we start doin the thing?
          // enable: true,
          // enableEgress: true,
        },
      },
    },
  },
}, { provider });

export { ip, versions, internalClass };
