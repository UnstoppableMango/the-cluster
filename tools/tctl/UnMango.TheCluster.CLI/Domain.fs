namespace UnMango.TheCluster.CLI.Domain

open System
open System.IO
open Pulumi.Automation
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Pulumi

module ProjectType =
    let name =
        function
        | App -> "App"
        | Cluster -> "Cluster"
        | Database -> "Database"
        | Infrastructure -> "Infrastructure"

module Project =
    let runtimeName =
        function
        | Typescript -> ProjectRuntimeName.NodeJS
        | FSharp -> ProjectRuntimeName.Dotnet

    let defaultName = Path.GetFileName(Environment.CurrentDirectory)
    let defaultStack = "pinkdiamond"

    let from (command: Commands.New) : PulumiProject =
        { Lang = command.Lang
          Name = command.Name |> Option.defaultValue defaultName
          Runtime = runtimeName command.Lang
          Stack = command.Stack |> Option.defaultValue defaultStack
          Type = command.Type }

    let create (command: Commands.New) =
        from command |> Pulumi.createProject command.Force
