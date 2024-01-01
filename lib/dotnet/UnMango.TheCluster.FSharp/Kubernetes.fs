module UnMango.TheCluster.Pulumi.Kubernetes

open Pulumi.Kubernetes.Core.V1

module Core =
    module V1 =
        module Namespace =
            let create name args opts = Namespace(name, args, opts)
