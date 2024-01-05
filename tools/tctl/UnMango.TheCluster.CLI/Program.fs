open System
open System.Threading.Tasks
open Argu
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Domain

module New =
    let run (args: ParseResults<NewArgs>) =
        match args with
        | x when x.UnrecognizedCliParams.Length > 0 ->
            Console.WriteLine("Unrecognized arguments: {0}", x.UnrecognizedCliParams)
            |> (fun _ -> Task.FromResult(1))
        | x when x.IsUsageRequested -> x.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> Task.FromResult(0))
        | x -> x |> Commands.New.from |> Project.create

[<EntryPoint>]
let main args =
    let reader = EnvironmentVariableConfigurationReader() :> IConfigurationReader

    ArgumentParser.Create<Args>(programName = "tctl")
    |> _.Parse(args, configurationReader = reader, raiseOnUsage = false, ignoreUnrecognized = true)
    |> function
        | x when x.UnrecognizedCliParams.Length > 0 ->
            Console.WriteLine("Unrecognized arguments: {0}", x.UnrecognizedCliParams)
            |> (fun _ -> 1)
        | x when x.Contains New -> x.Catch(fun () -> x.GetResult New |> New.run |> _.Result)
        | x -> x.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> 0)
