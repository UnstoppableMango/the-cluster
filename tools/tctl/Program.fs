open Argu
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Commands

[<EntryPoint>]
let main args =
    let parser = ArgumentParser.Create<Args>(programName = "tctl")

    parser.Parse(args)
    |> (_.GetAllResults())
    |> List.head
    |> Root.run
    |> (_.Result)
