module UnMango.TheCluster.FSharp.Kubernetes

open Pulumi.Kubernetes.Core.V1

module Core =
    module V1 =
        module Namespace =
            let create name args opts = Namespace(name, args, opts)

        module ConfigMap =
            let create name args opts = ConfigMap(name, args, opts)

        module Secret =
            let create name args opts = Secret(name, args, opts)
