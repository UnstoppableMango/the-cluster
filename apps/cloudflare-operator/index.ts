import { kustomize } from '@pulumi/kubernetes';
import { Secret } from '@pulumi/kubernetes/core/v1';
import { cloudflare } from './config';

const kustomization = new kustomize.Directory('cloudflare-operator', {
  directory: './',
});

const ns = kustomization.getResource('v1/Namespace', 'cloudflare-operator-system');

const secret = new Secret('api-secrets', {
  metadata: {
    name: 'api-secrets',
    namespace: ns.metadata.name,
  },
  stringData: {
    CLOUDFLARE_API_TOKEN: cloudflare.apiToken,
    CLOUDFLARE_API_KEY: cloudflare.globalApiKey,
  },
});

export const namespace = ns.metadata.name;
export const apiSecretsName = secret.metadata.name;
