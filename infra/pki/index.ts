import { output, secret } from '@pulumi/pulumi';
import { root, postgres, letsencrypt, selfSigned, keycloak } from './issuers';
import { ns, trustNs } from './namespace';
import { bundles, trustLabel } from './config';

export const namespace = ns.metadata.name;
export const trustNamespace = trustNs.metadata.name;
export { trustLabel, bundles };

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
