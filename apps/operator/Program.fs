module Program

open Pulumi
open Pulumi.FSharp
open Pulumi.Kubernetes
open Pulumi.Kubernetes.Core.V1
open Pulumi.Kubernetes.Types.Inputs.Core.V1
open Pulumi.Kubernetes.Types.Inputs.Meta.V1
open UnMango.TheCluster.Operator.Pulumi

let infra () =
    let provider = ClusterProvider.FromStack()

    let manifests =
        Kustomize.Directory(
            "thecluster",
            Kustomize.DirectoryArgs(Directory = "../../operator"),
            ComponentResourceOptions(Provider = provider)
        )

    // Export outputs here.
    dict []

[<EntryPoint>]
let main _ = Deployment.run infra
