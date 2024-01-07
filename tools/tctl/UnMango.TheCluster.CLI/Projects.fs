module UnMango.TheCluster.CLI.Projects

open System
open System.IO
open System.Text.Json
open System.Threading.Tasks
open Fluid

let parser = FluidParser()

// yucc
let template t =
    let suc, tmpl, err = parser.TryParse t
    if suc then tmpl else failwithf $"Error: %s{err}"

module Ts =
    let write dir opts =
        [ File.WriteAllTextAsync(
              Path.Join(dir, "config.ts"),
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
              Path.Join(dir, "index.ts"),
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
              Path.Join(dir, "package.json"),
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
              Path.Join(dir, "tsconfig.json"),
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

module Fs =
    let write dir opts =
        [ File.WriteAllTextAsync(
              Path.Join(dir, $"UnMango.TheCluster.{opts.Name}.fsproj"),
              [ "<Project>" ] |> String.concat Environment.NewLine
          )
          File.WriteAllTextAsync(
              Path.Join(dir, "Program.fs"),
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
