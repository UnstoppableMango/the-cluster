namespace UnMango.TheCluster.CLI

open Argu.ArguAttributes

type Language =
    | [<CustomCommandLine("ts", "typescript")>] Typescript
    | [<CustomCommandLine("fs", "f#", "fsharp")>] FSharp

// The alt names don't currently work
type ProjectType =
    | [<CustomCommandLine("app", "apps")>] App
    | [<CustomCommandLine("cluster", "clusters")>] Cluster
    | [<CustomCommandLine("db")>] Database
    | [<CustomCommandLine("infra")>] Infrastructure

module ProjectType =
    let name =
        function
        | App -> "App"
        | Cluster -> "Cluster"
        | Database -> "Database"
        | Infrastructure -> "Infrastructure"

module New =
    type Opts =
        { Force: bool
          Name: string option
          Lang: Language
          Stack: string option
          Type: ProjectType }
