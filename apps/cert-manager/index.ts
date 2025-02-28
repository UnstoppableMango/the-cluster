import * as k8s from "@pulumi/kubernetes";

const ns = new k8s.core.v1.Namespace("cert-manager", {
  metadata: { name: "cert-manager" },
});

const chart = new k8s.helm.v4.Chart("cert-manager", {
  chart: "./",
  name: "cert-manager",
  namespace: ns.metadata.name,
  dependencyUpdate: true,
  values: {
    // https://github.com/cert-manager/cert-manager/blob/master/deploy/charts/cert-manager/README.template.md#configuration
    "cert-manager": {
      crds: {
        enabled: true,
        keep: true,
      },
      podDisruptionBudget: {
        enabled: true,
        minAvailable: 1,
      },
      enableCertificateOwnerRef: true,
    },
  },
});
