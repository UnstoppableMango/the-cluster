import { Output } from '@pulumi/pulumi';

export interface CephCsiOutputs {
  rbdStorageClass: Output<string>;
  cephfsStorageClass: Output<string>;
}

export interface CertManagerOutputs {
  /**
   * @deprecated Use `clusterIssuers.stage` instead
   */
  stage: Output<string>;

  /**
   * @deprecated Use `clusterIssuers.prod` instead
   */
  prod: Output<string>;
  clusterIssuers: {
    staging: Output<string>;
    prod: Output<string>;
    selfSigned: Output<string>;
  };
}

export interface CloudflareIngressOutputs {
  ingressClass: Output<string>;
}

export interface KeycloakOutputs {
  hostname: Output<string>;
  password: Output<string>;
}

export interface MetallbOutputs {
  pool: Output<string>;
}
