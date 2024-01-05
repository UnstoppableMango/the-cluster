namespace UnMango.TheCluster.CLI

open Argu

type NewArgs =
    | [<AltCommandLine("-c")>] Certificate of string list
    | [<AltCommandLine("--ca")>] CertificateAuthority
    | [<AltCommandLine("--helm")>] Chart
    | [<AltCommandLine("-f")>] Force
    | [<AltCommandLine("-l")>] Language of string
    | [<AltCommandLine("-n")>] Name of string
    | [<AltCommandLine("--ns")>] Namespace of string option
    | [<AltCommandLine("-o")>] OAuth
    | [<AltCommandLine("-t")>] Trust of string list
    | [<MainCommand; ExactlyOnce>] Type of string

    interface IArgParserTemplate with
        member args.Usage =
            match args with
            | Certificate _ -> "Request certs from the specified CAs"
            | CertificateAuthority -> "Scaffold a new CA"
            | Chart -> "Scaffold a helm chart"
            | Force -> "Ignore existing files in the target directory"
            | Language _ -> "The language the project uses"
            | Name _ -> "The name of the project"
            | Namespace _ -> "Override the generated namespace"
            | OAuth -> "Scaffold oauth"
            | Trust _ -> "Inject trust for the specified CAs"
            | Type _ -> "The type of the project"

type Args =
    | [<CliPrefix(CliPrefix.None)>] New of ParseResults<NewArgs>

    interface IArgParserTemplate with
        member arg.Usage =
            match arg with
            | New _ -> "Create a new THECLUSTER project"
