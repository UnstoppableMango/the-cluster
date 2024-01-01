module UnMango.TheCluster.FSharp.StackRef

open Pulumi
open Pulumi.FSharp

let clusterName name =
    $"UnstoppableMango/thecluster-{name}/prod"

let stackName name cluster =
    $"UnstoppableMango/thecluster-{name}/{cluster}"

let cluster name =
    StackReference(name, StackReferenceArgs(Name = clusterName name))

let stack name cluster =
    StackReference(name, StackReferenceArgs(Name = stackName name cluster))

let requireObject<'a> (key: string) (r: StackReference) : Output<'a> =
    r.RequireOutput(key) |> Outputs.apply (fun o -> downcast o)
