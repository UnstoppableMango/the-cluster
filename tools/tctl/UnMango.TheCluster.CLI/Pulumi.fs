module UnMango.TheCluster.CLI.Pulumi

open System
open System.IO
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

    let createProject force (opts: PulumiProject) =
        let empty: string -> bool = Directory.GetFileSystemEntries >> Array.length >> (=) 0

        let create workingDirectory =
            task {
                let settings =
                    ProjectSettings(
                        opts.Name,
                        ProjectRuntime(opts.Runtime),
                        Description = $"{opts.Name |> To.TitleCase.Transform} install for THECLUSTER"
                    )
                
                let wsOpts = LocalWorkspaceOptions(WorkDir = workingDirectory)
                use! ws = LocalWorkspace.CreateAsync(wsOpts)
                let fqsn = $"UnstoppableMango/{opts.Name}/{opts.Stack}"

                do! ws.CreateStackAsync(fqsn)
                do! ws.SaveProjectSettingsAsync(settings)

                let template =
                    match opts.Lang with
                    | Typescript -> Ts.template
                    | FSharp -> Fs.template

                template {| Name = "testy" |}
                |> Map.iter (fun file t ->
                    Console.WriteLine($"File: {file}")
                    Console.WriteLine($"Template:\n{t}"))

                // do! write workingDirectory opts
                //
                // do! ws.SetConfigAsync(stack, "test", ConfigValue("testing"))
                // let! stacks = ws.ListStacksAsync()
                //
                // let! pYaml = Path.Join(workingDirectory, "Pulumi.yaml") |> File.ReadAllTextAsync
                //
                // Console.WriteLine(File.ReadAllText(Path.Join(workingDirectory, $"Pulumi.{stack}.yaml")))
                // Console.WriteLine("Current stacks are: {0}", seq stacks |> Seq.map (_.Name))

                return 0
            }

        // let workingDirectory = Environment.CurrentDirectory
        let workingDirectory = "/tmp/tctl/test"

        if not force && not <| empty workingDirectory then
            failwith $"Directory {workingDirectory} is not empty, pass --force to ignore"
        else
            create workingDirectory
