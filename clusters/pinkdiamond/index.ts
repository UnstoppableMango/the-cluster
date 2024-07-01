import { jsonStringify } from '@pulumi/pulumi';
import * as YAML from 'yaml';
import * as certs from './certs';
import { Node, Versions, caPem, config, stack } from './config';
