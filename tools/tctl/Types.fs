namespace UnMango.TheCluster.CLI

type Language =
    | Typescript
    | FSharp

module Lang =
    let parse =
        function
        | "typescript"
        | "ts" -> Ok Typescript
        | "f#"
        | "F#"
        | "FSharp"
        | "Fsharp"
        | "fsharp" -> Ok FSharp
        | lang -> Error $"Language \"{lang}\" is invalid"

type ProjectType =
    | App
    | Cluster
    | Database
    | Infrastructure

module ProjectType =
    let parse =
        function
        | "app"
        | "apps" -> Ok App
        | "cluster"
        | "clusters" -> Ok Cluster
        | "db"
        | "database" -> Ok Database
        | "infra"
        | "infrastructure" -> Ok Infrastructure
        | t -> Error $"Project type \"{t}\" is invalid"

module New =
    type Opts =
        { Name: string option
          Type: ProjectType
          Lang: Language }
