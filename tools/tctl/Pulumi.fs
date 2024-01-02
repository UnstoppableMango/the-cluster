namespace UnMango.TheCluster.CLI

open System
open Pulumi.Automation

type PulumiProject =
    { Name: string
      Runtime: ProjectRuntimeName
      Type: ProjectType }

module Pulumi =
    let template = ProjectTemplate(Description = "A template for THECLUSTER projects")

    let createProject (opts: PulumiProject) =
        task {
            let workingDirectory = Environment.CurrentDirectory

            let settings =
                ProjectSettings(
                    opts.Name,
                    ProjectRuntime(opts.Runtime),
                    Description = "TODO: {app} install for THECLUSTER",
                    Template = template
                )

            let wsOpts = LocalWorkspaceOptions(WorkDir = "/tmp/tctl/test")
            // let! ws = LocalWorkspace.CreateAsync(LocalWorkspaceOptions(WorkDir = "/tmp/tctl/test"))
            // do! ws.CreateStackAsync("UnstoppableMango/tctl-create-test/test")
            // let! stacks = ws.ListStacksAsync()
            // Console.WriteLine("Current working directory is: {0}", workingDirectory)
            // Console.WriteLine("Current stacks are: {0}", seq stacks |> Seq.map (_.Name))
            // do! ws.RemoveStackAsync("UnstoppableMango/tctl-create-test/test")
            Console.WriteLine("Got here")
            return 1
        }
