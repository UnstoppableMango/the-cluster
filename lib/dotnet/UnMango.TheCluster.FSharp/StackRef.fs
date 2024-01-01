module UnMango.TheCluster.Pulumi.StackRef

open Pulumi
open Pulumi.FSharp

let cluster name =
    StackReference(name, StackReferenceArgs(Name = $"UnstoppableMango/thecluster-{name}/prod"))

let requireObject<'a> (key: string) (r: StackReference) : Output<'a> =
    r.RequireOutput(key) |> Outputs.apply (fun o -> downcast o)
