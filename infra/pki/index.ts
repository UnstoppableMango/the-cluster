import * as pulumi from '@pulumi/pulumi';
import * as is from './issuers';
import { ns, trustNs } from './namespace';

export const namespace = ns.metadata.name;
export const trustNamespace = trustNs.metadata.name;

export const clusterIssuers = {
  group: pulumi.output('cert-manager.io'),
  kind: pulumi.output('ClusterIssuer'),
  stage: pulumi.output(is.letsencrypt.stage.metadata).apply(x => x?.name ?? ''),
  staging: pulumi.output(is.letsencrypt.stage.metadata).apply(x => x?.name ?? ''),
  prod: pulumi.output(is.letsencrypt.prod.metadata).apply(x => x?.name ?? ''),
  selfSigned: pulumi.output(is.selfSigned.issuer.metadata).apply(x => x?.name ?? ''),
  root: pulumi.output(is.root.issuer.metadata).apply(x => x?.name ?? ''),
};

export const issuers = {
  group: pulumi.output('cert-manager.io'),
  kind: pulumi.output('Issuer'),
};

export const bundles = {
  root: {
    name: pulumi.output(is.root.bundle.metadata).apply(x => x?.name),
    key: pulumi.output(is.root.bundle.spec).apply(x => x.target.configMap?.key),
    additionalFormats: pulumi.output(is.root.bundle.spec).apply(x => x.target.additionalFormats),
    matchLabels: pulumi.output(is.root.bundle.spec).apply(x => x.target.namespaceSelector?.matchLabels),
  },
}
