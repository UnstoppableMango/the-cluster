namespace UnMango.TheCluster.CLI

type Language =
    | Typescript
    | FSharp

module Lang =
    let parse =
        function
        | "typescript"
        | "ts" -> Typescript
        | "f#"
        | "F#"
        | "FSharp"
        | "Fsharp"
        | "fsharp" -> FSharp
        | lang -> failwithf $"Invalid language: {lang}"

module New =
    type Opts =
        { Name: string option
          Type: string
          Lang: Language }
