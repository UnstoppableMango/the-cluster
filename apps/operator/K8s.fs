[<AutoOpen>]
module UnMango.TheCluster.Operator.Pulumi.K8s

open Pulumi.Kubernetes.Types.Inputs.Core.V1

module Core =
    [<AutoOpen>]
    module V1 =
        module Namespace =
            let create name = Kubernetes.Core.V1.Namespace.create name (NamespaceArgs())
