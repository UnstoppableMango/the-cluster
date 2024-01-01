module Program

open System.Collections.Generic
open System.IO
open Pulumi
open Pulumi.Crds.Pulumi.V1
open Pulumi.FSharp
open Pulumi.Kubernetes.Core.V1
open Pulumi.Kubernetes.Types.Inputs.Pulumi.V1
open Pulumi.Kubernetes.Types.Outputs.Meta.V1
open Pulumi.PulumiService
open UnMango.TheCluster.FSharp

module Option =
    let ofBool a f = Option.filter f (Some a)

let require m v a = if v a then a else failwith m

let gather xs = xs |> Map.keys |> seq, xs

type ClusterStack =
    { ``type``: string
      commit: string
      dependsOn: string[] }

let repoDir name stack =
    match stack.``type`` with
    | "app"
    | "apps" -> "apps"
    | "cluster"
    | "clusters" -> "clusters"
    | "dbs"
    | "infra" as x -> x
    | x -> failwith $"Invalid stack type: {x}"
    |> fun dir -> Path.Join(dir, name)

let preReqs depends =
    [ for x in depends do
          StackSpecPrerequisitesArgs(Name = x) |> Ops.input ]

let spec name stack secret =
    StackSpecArgs(
        AccessTokenSecret = secret,
        Stack = $"UnstoppableMango/thecluster-{name}/{TheCluster.Name()}",
        Commit = stack.commit,
        Refresh = true,
        RepoDir = repoDir name stack,
        ProjectRepo = "https://github.com/UnstoppableMango/the-cluster",
        DestroyOnFinalize = false,
        UseLocalStackOnly = true,
        Prerequisites =
            (match stack.dependsOn with
             | null -> [||]
             | x -> x
             |> Seq.append []
             |> Seq.map Ops.input
             |> preReqs
             |> Ops.inputList)
    )

let stack opts t ns n s =
    Stack(n, StackArgs(Metadata = K8s.meta n ns, Spec = spec n s t), opts)

let name (meta: Output<ObjectMeta>) = meta |> Outputs.apply (_.Name)

let getDepends (x: Stack) =
    x.Spec |> Outputs.apply (_.Prerequisites >> seq >> Seq.map (_.Name))

let validate ns xs = xs
// TODO: Some fuckin set comparison shit
// xs
// |> (Map.values
//     >> Seq.map (
//         getDepends
//         >> Outputs.apply (Set.ofSeq >> require "Dependency validation" (Set.isSuperset (Set.ofSeq ns)))
//     ))
// |> ignore
//
// xs

let infra () : IDictionary<string, obj> =
    let config = Config()
    let stacks = config.RequireObject<Map<string, ClusterStack>>("stacks")
    let opts = TheCluster.OptsFromStack()

    let accessToken =
        AccessToken(
            "thecluster-stacks",
            AccessTokenArgs(Description = "Token for the operator to use to deploy stacks")
        )

    let ns = Namespace.Get("pulumi-operator", "pulumi-operator", opts)

    let secret =
        (Ops.inputMap [ "accessToken", accessToken.Value |> Ops.io ])
        |> K8s.secret opts "access-token" (name ns.Metadata |> Ops.io)

    stacks
    |> Map.map (ns.Metadata |> name |> Ops.io |> stack opts (name secret.Metadata |> Ops.io))
    |> (gather >> (fun (n, x) -> validate n x))
    |> Map.map (fun _ s -> s.Spec |> Outputs.apply (_.Commit) :> obj)
    |> Map.toList
    |> dict

[<EntryPoint>]
let main _ = Deployment.run infra
