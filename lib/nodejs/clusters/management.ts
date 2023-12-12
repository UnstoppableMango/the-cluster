import { Config, Output, StackReference } from '@pulumi/pulumi';
import * as cluster from '../cluster';
import * as k8s from '@pulumi/kubernetes';
import { AppRefs } from '../internal/apps';

export const name = new Config().require('managementCluster');
export const kubeconfig = cluster.ref(name).requireOutput('kubeconfig') as Output<string>;
export const provider = new k8s.Provider(name, { kubeconfig });
export const appRefs = new AppRefs(name);
