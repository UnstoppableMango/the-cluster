namespace UnMango.TheCluster.CLI

open System.Text.Json.Serialization
open Argu.ArguAttributes

// The alt names don't currently work
type Language =
    | [<CustomCommandLine("ts", "typescript")>] Typescript
    | [<CustomCommandLine("fs", "f#", "fsharp")>] FSharp

// The alt names don't currently work
type ProjectType =
    | [<CustomCommandLine("app", "apps")>] App
    | [<CustomCommandLine("cluster", "clusters")>] Cluster
    | [<CustomCommandLine("db")>] Database
    | [<CustomCommandLine("infra")>] Infrastructure

type PackageJson =
    { [<JsonPropertyOrder(1)>]
      Name: string
      [<JsonPropertyOrder(2)>]
      Main: string
      [<JsonPropertyOrder(3)>]
      Dependencies: Map<string, string>
      [<JsonPropertyOrder(4)>]
      DevDependencies: Map<string, string> }
