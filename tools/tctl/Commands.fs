module UnMango.TheCluster.CLI.Commands

open Argu

module New =
    type Parsed =
        { Name: string option
          Lang: Result<Language, string>
          Stack: string option
          Type: Result<ProjectType, string> }

        static member Empty() =
            { Name = None
              Lang = Ok Typescript
              Stack = None 
              Type = Error "Type is required" }

    module Opts =
        let folder p c : Parsed =
            match c with
            | Language lang -> { p with Lang = Lang.parse lang }
            | Name name -> { p with Name = Some name }
            | Type t -> { p with Type = ProjectType.parse t }

        let parse =
            Seq.fold folder (Parsed.Empty())
            >> function
                | { Parsed.Name = name
                    Lang = Ok lang
                    Stack = stack
                    Type = Ok t } ->
                    Ok
                        { New.Opts.Name = name
                          New.Opts.Lang = lang
                          New.Opts.Stack = stack
                          New.Opts.Type = t }
                | { Type = Error msg } -> Error msg
                | { Lang = Error msg } -> Error msg

    let consume (results: ParseResults<NewArgs>) =
        function
        | Ok(opts: New.Opts) -> Project.create opts
        | Error(msg: string) -> results.Raise(msg, ErrorCode.CommandLine, true)

    let run (args: ParseResults<NewArgs>) =
        args.GetAllResults() |> Opts.parse |> consume args

module Root =
    let run =
        function
        | New args -> New.run args
