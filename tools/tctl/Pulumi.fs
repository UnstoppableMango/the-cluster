namespace UnMango.TheCluster.CLI

open System
open System.IO
open Humanizer
open Pulumi.Automation

type PulumiProject =
    { Name: string
      Runtime: ProjectRuntimeName
      Stack: string
      Type: ProjectType }

module Pulumi =
    let template =
        ProjectTemplate(
            Description = "A template for THECLUSTER projects",
            Config = dict [ "test", ProjectTemplateConfigValue(Description = "testing") ]
        )

    let createProject (opts: PulumiProject) =
        task {
            // let workingDirectory = Environment.CurrentDirectory
            let workingDirectory = "/tmp/tctl/test"

            let settings =
                ProjectSettings(
                    opts.Name,
                    ProjectRuntime(opts.Runtime),
                    Description = $"{opts.Name |> To.TitleCase.Transform} install for THECLUSTER"
                )

            let wsOpts = LocalWorkspaceOptions(WorkDir = workingDirectory)
            use! ws = LocalWorkspace.CreateAsync(wsOpts)
            let stack = "test"
            let fqsn = $"UnstoppableMango/{opts.Name}/{stack}"

            do! ws.CreateStackAsync(fqsn)
            do! ws.SaveProjectSettingsAsync(settings)
            // do! ws.SetConfigAsync(stack, "test", ConfigValue("testing"))
            // let! stacks = ws.ListStacksAsync()
            Console.WriteLine(File.ReadAllText(Path.Join(workingDirectory, "Pulumi.yaml")))
            // Console.WriteLine(File.ReadAllText(Path.Join(workingDirectory, $"Pulumi.{stack}.yaml")))
            // Console.WriteLine("Current stacks are: {0}", seq stacks |> Seq.map (_.Name))
            do! ws.RemoveStackAsync(fqsn)
            return 1
        }
