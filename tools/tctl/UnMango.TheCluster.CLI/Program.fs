open System
open System.Threading.Tasks
open Argu
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Domain

module New =
    let run (args: ParseResults<Args.New>) =
        match args with
        | Commands.AnyUnrecognized x -> Commands.handleUnrecognized x
        | Commands.ShouldShowUsage -> args.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> Task.FromResult(0))
        | x -> x.Catch((fun () -> Project.create x), ErrorCode.PostProcess, showUsage = x.IsUsageRequested)

[<EntryPoint>]
let main args =
    let reader = EnvironmentVariableConfigurationReader() :> IConfigurationReader

    ArgumentParser.Create<Args.Root>(programName = "tctl")
    |> _.Parse(args, configurationReader = reader, raiseOnUsage = false, ignoreUnrecognized = true)
    |> function
        | Commands.AnyUnrecognized x -> Commands.handleUnrecognized x
        | x when x.Contains Args.New -> x.Catch(fun () -> x.GetResult Args.New |> New.run)
        | x -> x.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> Task.FromResult(0))
    |> _.Result
