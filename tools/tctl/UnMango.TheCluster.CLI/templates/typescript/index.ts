import { Namespace } from '@pulumi/kubernetes/core/v1';
import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';
import { versions } from './config';

const ns = new Namespace('{opts.Name}'), {{
  metadata: {{ name: '{opts.Name}' }},
}, { provider });
