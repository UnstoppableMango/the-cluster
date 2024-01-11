open System
open System.Threading
open System.Threading.Tasks
open Argu
open UnMango.TheCluster.CLI
open UnMango.TheCluster.CLI.Domain

module New =
    let run cancellationToken (args: ParseResults<Args.New>) =
        match args with
        | Commands.AnyUnrecognized x -> Commands.handleUnrecognized x
        | Commands.ShouldShowUsage -> Commands.showUsage args
        | x ->
            x.Catch(
                (fun () -> Project.create x cancellationToken),
                ErrorCode.PostProcess,
                showUsage = x.IsUsageRequested
            )

[<EntryPoint>]
let main args =
    use cts = new CancellationTokenSource()
    let reader = EnvironmentVariableConfigurationReader() :> IConfigurationReader

    ArgumentParser.Create<Args.Root>(programName = "tctl")
    |> _.Parse(args, configurationReader = reader, raiseOnUsage = false, ignoreUnrecognized = true)
    |> function
        | Commands.AnyUnrecognized x -> Commands.handleUnrecognized x
        | x when x.Contains Args.New -> x.GetResult Args.New |> New.run cts.Token
        | x -> x.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> Task.FromResult(0))
    |> Async.AwaitTask
    |> Async.RunSynchronously
