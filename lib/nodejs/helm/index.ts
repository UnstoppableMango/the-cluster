import * as ts from 'json-schema-to-ts';
import { filebrowser } from './schemas/filebrowser.values.schema.json';
import { k8sDefinitions } from './schemas/k8sDefinitions._definitions.json';
import { nginxIngress } from './schemas/nginxIngress.values.schema.json';

export type FileBrowserValues = ts.FromSchema<typeof filebrowser>;
export type Definitions = ts.FromSchema<typeof k8sDefinitions>;

export type NginxIngressValues = ts.FromSchema<
	typeof nginxIngress,
	{ references: [typeof k8sDefinitions] }
>;

const test: NginxIngressValues = {};
