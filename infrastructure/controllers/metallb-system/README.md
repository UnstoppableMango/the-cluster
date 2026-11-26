# metallb

## Measurements

- The controller reconciles every namespace and service in the cluster, not only those with a LoadBalancer address: 69 namespaces and 68 services, against 11 LoadBalancer services and one IPAddressPool.
  It idles at 225Mi and was OOM killed on reconcile bursts above that, with exit 137 and the log ending on a clean `end reconcile`.
- The speaker measured 132m CPU during a burst, against a 2m idle baseline.
