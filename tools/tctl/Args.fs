namespace UnMango.TheCluster.CLI

open Argu

type NewArgs =
    | [<AltCommandLine("-l")>] Language of string
    | [<AltCommandLine("-n")>] Name of string
    | [<MainCommand; ExactlyOnce>] Type of string
    
    interface IArgParserTemplate with
        member args.Usage =
            match args with
            | Language _ -> "The language the project uses"
            | Name _ -> "The name of the project"
            | Type _ -> "The type of the project"

type Args =
    | [<CliPrefix(CliPrefix.None)>] New of ParseResults<NewArgs>
    
    interface IArgParserTemplate with
        member arg.Usage =
            match arg with
            | New _ -> "Create a new THECLUSTER project"
