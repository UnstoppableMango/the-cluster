import { Output } from '@pulumi/pulumi';

export interface CephCsiOutputs {
  rbdStorageClass: Output<string>;
  cephfsStorageClass: Output<string>;
}

export interface CertManagerOutputs {
  clusterIssuers: {
    group: Output<string>;
    kind: Output<string>;
    stage: Output<string>;
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

export interface PostgreSqlOutputs {
  ip: Output<string>;
  database: Output<string>;
  port: Output<number>;
  hostname: Output<string>;
  credentials: Output<{
    username: Output<string>;
    password: Output<string>;
  }>[];
}

export interface PostgresDbOutputs {
  users: Output<{
    username: Output<string>;
    password: Output<string>;
  }>[];
}

export interface DroneDbOutputs {
  user: Output<{
    username: Output<string>;
    password: Output<string>;
  }>;
}

export interface KeycloakDbOutputs {
  user: Output<{
    username: Output<string>;
    password: Output<string>;
  }>;
}

export interface IdentityOutputs {
  hostname: Output<string>;
  username: Output<string>;
  password: Output<string>;
  realms: Output<{
    external: Output<{
      id: Output<string>;
    }>;
    cluster: Output<{
      id: Output<string>;
    }>;
  }>;
  groupNames: Output<Output<string>[]>;
  groups: Output<Record<string, Output<string>>>;
}
