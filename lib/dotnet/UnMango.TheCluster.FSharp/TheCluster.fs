namespace UnMango.TheCluster.FSharp

open Pulumi
open Pulumi.Kubernetes

// Not sure where I'm going with this

type TheCluster =
    { StackReference: StackReference
      Provider: Provider }

    static member OptsFromStack() =
        CustomResourceOptions(Provider = ClusterProvider.FromStack())

module TheClusterBuilder =
    let bind f x = f x

type TheClusterBuilder() =
    member this.Bind(comp, func) = TheClusterBuilder.bind func comp

[<AutoOpen>]
module TheCluster =
    let thecluster = TheClusterBuilder()

    let opts n =
        CustomResourceOptions(Provider = ClusterProvider.forCluster n)
