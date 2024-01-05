namespace UnMango.TheCluster.CLI

open System
open System.IO
open System.Text.Json
open System.Text.Json.Serialization
open System.Threading.Tasks
open Humanizer
open Pulumi.Automation

type PulumiProject =
    { Lang: Language
      Name: string
      Runtime: ProjectRuntimeName
      Stack: string
      Type: ProjectType }

type PackageJson =
    { [<JsonPropertyOrder(1)>]
      Name: string
      [<JsonPropertyOrder(2)>]
      Main: string
      [<JsonPropertyOrder(3)>]
      Dependencies: Map<string, string>
      [<JsonPropertyOrder(4)>]
      DevDependencies: Map<string, string> }

module Pulumi =
    let template =
        ProjectTemplate(
            Description = "A template for THECLUSTER projects",
            Config = dict [ "test", ProjectTemplateConfigValue(Description = "testing") ]
        )

    let createProject force (opts: PulumiProject) =
        let empty workingDirectory =
            Directory.GetFileSystemEntries(workingDirectory) |> Array.length = 0

        let writeTs workingDirectory =
            [ File.WriteAllTextAsync(
                  Path.Join(workingDirectory, "config.ts"),
                  [ "import { Config } from '@pulumi/pulumi';"
                    String.Empty
                    "export interface Versions {"
                    "}"
                    String.Empty
                    "export config = new Config();"
                    "export const versions = config.getObject<Versions>('versions')"
                    String.Empty ]
                  |> String.concat Environment.NewLine
              )
              File.WriteAllTextAsync(
                  Path.Join(workingDirectory, "index.ts"),
                  [ "import { Namespace } from '@pulumi/kubernetes/core/v1';"
                    "import { provider } from '@unstoppablemango/thecluster/cluster/from-stack';"
                    "import { versions } from './config';"
                    String.Empty
                    $"const ns = new Namespace('{opts.Name}'), {{"
                    $"  metadata: {{ name: '{opts.Name}' }},"
                    "}, { provider });"
                    String.Empty ]
                  |> String.concat Environment.NewLine
              )
              File.WriteAllTextAsync(
                  Path.Join(workingDirectory, "package.json"),
                  JsonSerializer.Serialize(
                      { Name = opts.Name
                        Main = "index.ts"
                        Dependencies =
                          [ "@pulumi/kubernetes", "^4.6.1"
                            "@pulumi/pulumi", "^3.99.0"
                            "@unstoppablemango/thecluster", "file:../../lib/nodejs"
                            "@unstoppablemango/thecluster-crds", "file:../../lib/crds/nodejs" ]
                          |> Map
                        DevDependencies = [ "@types/node", "^20.10.0" ] |> Map },
                      JsonSerializerOptions(WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase)
                  )
                  + Environment.NewLine
              )
              File.WriteAllTextAsync(
                  Path.Join(workingDirectory, "tsconfig.json"),
                  JsonSerializer.Serialize(
                      {| CommpilerOptions =
                          {| Strict = true
                             OutDir = "bin"
                             Target = "es2016"
                             Module = "commonjs"
                             ModuleResolution = "node"
                             SourceMap = true
                             ExperimentalDecorators = true
                             Pretty = true
                             NoFallthroughCasesInSwitch = true
                             NoImplicitReturns = true
                             ForceConsistentCasingInFileNames = true |}
                         Files = [ "index.ts" ] |},
                      JsonSerializerOptions(WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase)
                  )
                  + Environment.NewLine
              ) ]
            |> Task.WhenAll

        let writeFsharp workingDirectory =
            [ File.WriteAllTextAsync(
                  Path.Join(workingDirectory, $"UnMango.TheCluster.{opts.Name}.fsproj"),
                  [ "<Project>" ] |> String.concat Environment.NewLine
              )
              File.WriteAllTextAsync(
                  Path.Join(workingDirectory, "Program.fs"),
                  [ $"namespace UnMango.TheCluster.{opts.Name}"
                    "open Pulumi"
                    "open UnMango.TheCluster"
                    String.Empty
                    "let deployment ="
                    "    dict []"
                    String.Empty
                    "[<Entrypoint>]"
                    "let main = Deployment.run deployment" ]
                  |> String.concat Environment.NewLine
              ) ]
            |> Task.WhenAll

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

                // do! ws.CreateStackAsync(fqsn)
                // do! ws.SaveProjectSettingsAsync(settings)

                let write =
                    match opts.Lang with
                    | Typescript -> writeTs
                    | FSharp -> writeFsharp

                do! write workingDirectory

                // do! ws.SetConfigAsync(stack, "test", ConfigValue("testing"))
                // let! stacks = ws.ListStacksAsync()

                // let! pYaml = Path.Join(workingDirectory, "Pulumi.yaml") |> File.ReadAllTextAsync

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
