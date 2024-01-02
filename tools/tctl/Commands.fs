module UnMango.TheCluster.CLI.Commands

open System
open Argu

module New =
    type Parsed =
        { Name: string option
          Type: string option
          Lang: Language }

    module Opts =
        let folder p c : Parsed =
            match c with
            | Language lang -> { p with Lang = Lang.parse lang }
            | Name name -> { p with Name = Some name }
            | Type t -> { p with Type = Some t }

        let parse =
            { Name = None
              Type = None
              Lang = Typescript }
            |> Seq.fold folder
            >> function
                | { Name = name
                    Type = Some t
                    Lang = lang } ->
                    Ok
                        { New.Opts.Name = name
                          New.Opts.Type = t
                          New.Opts.Lang = lang }
                | { Type = None } -> Error "The project type is required"

    let consume (results: ParseResults<NewArgs>) =
        function
        | Ok(opts: New.Opts) ->
            Console.WriteLine("Got name: {0}", opts.Name)
            Console.WriteLine("Got type: {0}", opts.Type)
            Console.WriteLine("Got language: {0}", opts.Lang)
            0
        | Error msg ->
            results.Parser.PrintUsage(msg) |> Console.WriteLine
            1

    let run (args: ParseResults<NewArgs>) =
        args.GetAllResults() |> Opts.parse |> consume args
