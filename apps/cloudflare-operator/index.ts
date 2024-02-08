import { provider } from './config';
import { kustomize } from '@pulumi/kubernetes';

const kustomization = new kustomize.Directory('cloudflare-operator', {
  directory: './',
}, { provider });
