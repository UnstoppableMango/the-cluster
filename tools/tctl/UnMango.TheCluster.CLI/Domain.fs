namespace UnMango.TheCluster.CLI

open System
open System.IO
open Pulumi.Automation

module Project =
    let runtimeName =
        function
        | Typescript -> ProjectRuntimeName.NodeJS
        | FSharp -> ProjectRuntimeName.Dotnet

    let defaultName = Path.GetFileName(Environment.CurrentDirectory)
    let defaultStack = "pinkdiamond"

    let parse =
        function
        | { New.Opts.Name = name
            New.Opts.Lang = lang
            New.Opts.Stack = stack
            New.Opts.Type = t } ->
            { PulumiProject.Lang = lang
              Name = name |> Option.defaultValue defaultName
              Runtime = runtimeName lang
              Stack = stack |> Option.defaultValue defaultStack
              Type = t }

    let create (opts: New.Opts) = parse opts |> Pulumi.createProject opts.Force
