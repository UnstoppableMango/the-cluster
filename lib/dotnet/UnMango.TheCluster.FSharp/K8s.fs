module UnMango.TheCluster.FSharp.K8s

open Pulumi.Kubernetes.Types.Inputs.Core.V1
open Pulumi.Kubernetes.Types.Inputs.Meta.V1

let meta n ns =
    ObjectMetaArgs(Name = n, Namespace = ns)

let metaName n = ObjectMetaArgs(Name = n)

module Core =
    [<AutoOpen>]
    module V1 =
        module Namespace =
            let create name opts =
                Kubernetes.Core.V1.Namespace.create name (NamespaceArgs(Metadata = metaName name)) opts

let ns o n = Core.V1.Namespace.create n o
