import * as fs from 'node:fs/promises';
import {ConfigMap, Namespace} from '@pulumi/kubernetes/core/v1';
import {Chart} from '@pulumi/kubernetes/helm/v3';
import {provider} from '@unmango/thecluster/cluster/from-stack';
import {CustomResourceOptions} from '@pulumi/pulumi';
import {versions} from './config';

const ns = new Namespace('verdaccio', {
  metadata: {name: 'verdaccio'},
}, {provider});

const cm = new ConfigMap('config', {
  metadata: {
    name: 'config',
    namespace: ns.metadata.name,
  },
  data: {
    'config.yaml': fs.readFile('assets/config.yaml', 'utf-8'),
  },
}, {provider});

const chart = new Chart('verdaccio', {
  path: './',
  namespace: ns.metadata.name,
  values: {
    verdaccio: {
      image: {
        repository: 'verdaccio/verdaccio',
        tag: versions.verdaccio,
      },
      existingConfigMap: cm.metadata.name,
      service: {
        type: 'ClusterIP',
      },
    },
  },
  transformations: [(obj: any, opts: CustomResourceOptions) => {
    if (obj.kind === 'ConfigMap' && obj.metadata.name === 'verdaccio') {
      obj.kind = 'List'; // Remove the resource
    }
  }],
}, {provider});
