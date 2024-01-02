open System
open Argu
open UnMango.TheCluster.CLI

let consume =
    function
    | New args -> Commands.New.run args

[<EntryPoint>]
let main args =
    let parser = ArgumentParser.Create<Args>(programName = "tctl")
    parser.Parse(args) |> (_.GetAllResults()) |> List.head |> consume
