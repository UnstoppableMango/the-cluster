namespace UnMango.TheCluster.CLI

open Pulumi.Automation

module Project =
    let runtimeName =
        function
        | Typescript -> ProjectRuntimeName.NodeJS
        | FSharp -> ProjectRuntimeName.Dotnet

    let parse =
        function
        | { New.Opts.Name = Some name
            New.Opts.Lang = lang
            New.Opts.Type = t } ->
            { PulumiProject.Name = name
              Type = t
              Runtime = runtimeName lang }
        | _ -> failwith "TODO"

    let create (opts: New.Opts) = parse opts |> Pulumi.createProject
