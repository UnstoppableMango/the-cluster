module UnMango.TheCluster.CLI.Domain

open System
open System.IO
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Commands
open UnMango.TheCluster.CLI.Pulumi

module ProjectType =
    let name =
        function
        | App -> "App"
        | Cluster -> "Cluster"
        | Database -> "Database"
        | Infrastructure -> "Infrastructure"

module Project =
    let defaultName = Path.GetFileName(Environment.CurrentDirectory)
    let defaultStack = "pinkdiamond"

    let private from (command: NewProject) : PulumiProject =
        let lang =
            match command.Lang with
            | Args.Typescript -> Typescript
            | Args.FSharp -> FSharp

        let projectType =
            match command.Type with
            | Args.App -> App
            | Args.Cluster -> Cluster
            | Args.Database -> Database
            | Args.Infrastructure -> Infrastructure

        { Lang = lang
          Name = command.Name |> Option.defaultValue defaultName
          Runtime = Pulumi.runtimeName lang
          Stack = command.Stack |> Option.defaultValue defaultStack
          Type = projectType }

    let create (command: NewProject) =
        from command |> Pulumi.createProject command.Force
