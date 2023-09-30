import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// const chart = new k8s.helm.v3.Chart('cert-manager', {
//   path: './',
// });

// Use a release because the cert-manager helm chart uses hooks
const release = new k8s.helm.v3.Release('cert-manager', {
  chart: './',
  atomic: true,
  dependencyUpdate: true,
  lint: true,
});
