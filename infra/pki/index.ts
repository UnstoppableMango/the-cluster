import * as pulumi from '@pulumi/pulumi';
import { root, postgres, letsencrypt, selfSigned } from './issuers';
import { ns, trustNs } from './namespace';

export const namespace = ns.metadata.name;
export const trustNamespace = trustNs.metadata.name;

export const cas = pulumi.secret({
  root: root.ca.privateKeyPem,
  postgres: postgres.ca.metadata.apply(x => x?.name),
});

export const clusterIssuers = {
  group: pulumi.output('cert-manager.io'),
  kind: pulumi.output('ClusterIssuer'),
  stage: pulumi.output(letsencrypt.stage.metadata).apply(x => x?.name),
  staging: pulumi.output(letsencrypt.stage.metadata).apply(x => x?.name),
  prod: pulumi.output(letsencrypt.prod.metadata).apply(x => x?.name),
  selfSigned: pulumi.output(selfSigned.issuer.metadata).apply(x => x?.name),
  root: pulumi.output(root.issuer.metadata).apply(x => x?.name),
};

export const issuers = {
  group: pulumi.output('cert-manager.io'),
  kind: pulumi.output('Issuer'),
  postgres: postgres.issuer.metadata.apply(x => x?.name),
};

export const bundles = {
  root: {
    name: pulumi.output(root.bundle.metadata).apply(x => x?.name),
    key: pulumi.output(root.bundle.spec).apply(x => x.target.configMap?.key),
    additionalFormats: pulumi.output(root.bundle.spec).apply(x => x.target.additionalFormats),
    matchLabels: pulumi.output(root.bundle.spec).apply(x => x.target.namespaceSelector?.matchLabels),
  },
  postgres: {
    name: pulumi.output(postgres.bundle.metadata).apply(x => x?.name),
    key: pulumi.output(postgres.bundle.spec).apply(x => x.target.configMap?.key),
    additionalFormats: pulumi.output(postgres.bundle.spec).apply(x => x.target.additionalFormats),
    matchLabels: pulumi.output(postgres.bundle.spec).apply(x => x.target.namespaceSelector?.matchLabels),
  },
}
