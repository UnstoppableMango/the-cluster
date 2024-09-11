import * as config from './config';

// I'm not sure what I want to define as a "cluster" yet, and
// therefore where resources will live. So for now simply
// re-export the `kubeconfig` so that apps etc have a single
// source of truth

export const kubeconfig = config.kubeconfig.apply(x => {
  // I know this is lazy but I'm tired and I just want this working right now
  return x.replace('127.0.0.1', '192.168.1.100');
});
