namespace UnMango.TheCluster.CLI

open System.Text.Json.Serialization

type PackageJson =
    { [<JsonPropertyOrder(1)>]
      Name: string
      [<JsonPropertyOrder(2)>]
      Main: string
      [<JsonPropertyOrder(3)>]
      Dependencies: Map<string, string>
      [<JsonPropertyOrder(4)>]
      DevDependencies: Map<string, string> }
