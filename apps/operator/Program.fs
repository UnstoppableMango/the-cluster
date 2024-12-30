module Program

open System.Collections.Generic
open Pulumi.FSharp
open Pulumi.Kubernetes

let infra () : IDictionary<string, obj> =

    let d =
        Kustomize.V2.Directory(
            "operator",
            Types.Inputs.Kustomize.V2.DirectoryArgs(Directory = "../../operator/config/default")
        )

    dict [ "resources", d.Resources ]

[<EntryPoint>]
let main _ = Deployment.run infra
