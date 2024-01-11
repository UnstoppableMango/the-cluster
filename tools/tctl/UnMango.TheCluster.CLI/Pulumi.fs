module UnMango.TheCluster.CLI.Pulumi

open System
open System.IO
open System.Threading.Tasks
open Humanizer
open Pulumi.Automation
open UnMango.TheCluster.CLI.Projects

type Language =
    | Typescript
    | FSharp

type ProjectType =
    | App
    | Cluster
    | Database
    | Infrastructure

type PulumiProject =
    { Lang: Language
      Name: string
      Runtime: ProjectRuntimeName
      Stack: string
      Type: ProjectType }

module Pulumi =
    let runtimeName =
        function
        | Typescript -> ProjectRuntimeName.NodeJS
        | FSharp -> ProjectRuntimeName.Dotnet

    let template =
        ProjectTemplate(
            Description = "A template for THECLUSTER projects",
            Config = dict [ "test", ProjectTemplateConfigValue(Description = "testing") ]
        )

    let createProject force (opts: PulumiProject) cancellationToken =
        let empty: string -> bool = Directory.GetFileSystemEntries >> Array.length >> (=) 0

        let create workingDirectory =
            task {
                let settings =
                    ProjectSettings(
                        opts.Name,
                        ProjectRuntime(opts.Runtime),
                        Description = $"{opts.Name |> To.TitleCase.Transform} install for THECLUSTER"
                    )

                if not <| Directory.Exists(workingDirectory) then
                    Directory.CreateDirectory(workingDirectory) |> ignore

                let wsOpts = LocalWorkspaceOptions(WorkDir = workingDirectory)
                use! ws = LocalWorkspace.CreateAsync(wsOpts, cancellationToken)
                let fqsn = $"UnstoppableMango/{opts.Name}/{opts.Stack}"

                do! ws.SaveProjectSettingsAsync(settings, cancellationToken)
                do! ws.CreateStackAsync(fqsn, cancellationToken)

                do!
                    match opts.Lang with
                    | Typescript -> Ts.template opts
                    | FSharp -> Fs.template opts
                    |> Map.map (fun file contents ->
                        let path = Path.Join(workingDirectory, file)
                        File.WriteAllTextAsync(path, contents, cancellationToken))
                    |> Map.values
                    |> Task.WhenAll

                let! result = Tools.Npm.install [] workingDirectory cancellationToken
                return Ok result.ExitCode
            }

        let workingDirectory = Environment.CurrentDirectory

        if not force && not <| empty workingDirectory then
            failwith $"Directory {workingDirectory} is not empty, pass --force to ignore"
        else
            create workingDirectory

type Pulumi() =
    static member CreateProject() = 0
