open System
open System.Threading.Tasks
open Argu
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Commands

module New =
    let run (args: ParseResults<NewArgs>) =
        match args with
        | x when x.IsUsageRequested -> x.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> Task.FromResult(0))
        | x -> x.GetAllResults() |> New.Opts.parse |> New.consume args

[<EntryPoint>]
let main args =
    let reader = EnvironmentVariableConfigurationReader() :> IConfigurationReader

    ArgumentParser.Create<Args>(programName = "tctl")
    |> _.Parse(args, configurationReader = reader, raiseOnUsage = false)
    |> function
        | x when x.Contains New -> x.GetResult New |> New.run |> _.Result
        | x -> x.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> 0)
