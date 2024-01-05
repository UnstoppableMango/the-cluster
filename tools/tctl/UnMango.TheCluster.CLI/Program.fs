open Argu
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Commands

[<EntryPoint>]
let main args =
    let reader = EnvironmentVariableConfigurationReader() :> IConfigurationReader
    ArgumentParser.Create<Args>(programName = "tctl")
    |> _.Parse(args, configurationReader = reader)
    |> _.GetAllResults()
    |> List.head
    |> Root.run
    |> _.Result
