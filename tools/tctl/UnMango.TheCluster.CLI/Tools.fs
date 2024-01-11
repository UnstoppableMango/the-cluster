module UnMango.TheCluster.CLI.Tools

open CliWrap

let private run (command: Command) (args: string seq) directory cancellationToken =
    command
        .WithWorkingDirectory(directory)
        .WithArguments(args)
        .ExecuteAsync(cancellationToken)

module Npm =
    let command = Command("npm")
    let run = run command
    let install args = run ("install" :: args)
