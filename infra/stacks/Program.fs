module Program

open System.Collections.Generic
open Pulumi
open Pulumi.Crds.Pulumi.V1
open Pulumi.FSharp
open Pulumi.Kubernetes.Types.Inputs.Pulumi.V1
open Pulumi.Kubernetes.Types.Outputs.Meta.V1
open UnMango.TheCluster.FSharp

type ClusterStack = { Commit: string }

let spec n s =
    StackSpecArgs(Commit = s.Commit, Stack = $"UnstoppableMango/thecluster-{n}")

let stack ns n s =
    Stack(n, StackArgs(Metadata = K8s.meta n ns, Spec = spec n s))

let name (meta: Output<ObjectMeta>) = meta |> Outputs.apply (_.Name)

let infra () : IDictionary<string, obj> =
    let config = Config()
    let stacks = config.RequireObject<Map<string, ClusterStack>>("stacks")
    let opts = TheCluster.OptsFromStack()

    let ns = K8s.ns opts "thecluster" |> (_.Metadata) |> Outputs.apply (_.Name)
    let res = stacks |> Map.map (stack ns)

    res |> Map.map (fun _ s -> name s.Metadata :> obj) |> Map.toList |> dict

[<EntryPoint>]
let main _ = Deployment.run infra
