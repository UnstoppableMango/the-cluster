module UnMango.TheCluster.CLI.Tools

open CliWrap

module Npm =
    let install args directory =
        Command("npm").WithArguments(args)
