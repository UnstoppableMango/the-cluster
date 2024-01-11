import { all, output } from '@pulumi/pulumi';
import { Bundle } from '@unstoppablemango/thecluster-crds/trust/v1alpha1';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { root, postgres, letsencrypt, selfSigned, keycloak } from './issuers';
import { ns, trustNs } from './namespace';
import { bundles, trustLabel } from './config';

export const namespace = ns.metadata.name;
export const trustNamespace = trustNs.metadata.name;
export { trustLabel, bundles };

const bundle = new Bundle('thecluster-ca', {
  metadata: { name: 'thecluster-ca' },
  spec: {
    sources: all([
      output({ useDefaultCAs: true }),
      root.bundle.spec.sources,
      postgres.bundle.spec.sources,
      keycloak.bundle.spec.sources,
    ]).apply(x => x.flat()),
    target: {
      configMap: { key: bundles.key },
      additionalFormats: {
        jks: { key: bundles.jksKey },
        pkcs12: { key: bundles.p12Key },
      },
      namespaceSelector: {
        matchLabels: {
          [trustLabel]: 'thebundle',
        },
      },
    },
  },
}, { provider });


export const clusterIssuers = {
  group: output('cert-manager.io'),
  kind: output('ClusterIssuer'),
  stage: output(letsencrypt.stage.metadata).apply(x => x?.name),
  staging: output(letsencrypt.stage.metadata).apply(x => x?.name),
  prod: output(letsencrypt.prod.metadata).apply(x => x?.name),
  selfSigned: output(selfSigned.issuer.metadata).apply(x => x?.name),
  root: output(root.issuer.metadata).apply(x => x?.name),
  postgres: postgres.issuer.metadata.apply(x => x?.name),
  keycloak: keycloak.issuer.metadata.apply(x => x?.name),
};

export const issuers = {
  group: output('cert-manager.io'),
  kind: output('Issuer'),
};

export const configMaps = {
  root: root.bundle.metadata.apply(x => x?.name),
  postgres: postgres.bundle.metadata.apply(x => x?.name),
  keycloak: keycloak.bundle.metadata.apply(x => x?.name),
};
