import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

export class TlsStore extends k8s.apiextensions.CustomResource {

  constructor(name: string, args: TlsStoresArgs, opts?: pulumi.CustomResourceOptions) {
    super(name, {
      apiVersion: 'traefik.containo.us/v1alpha1',
      kind: 'TLSStore',
      metadata: args.metadata,
      spec: {
        defaultCertificate: {
          secretName: args.secretName,
        },
      },
    }, opts);
  }
}

interface ObjectMeta {
  name?: pulumi.Input<string>;
  namespace?: pulumi.Input<string>;
}

export interface TlsStoresArgs {
  metadata?: ObjectMeta;
  secretName: pulumi.Input<string>;
}
