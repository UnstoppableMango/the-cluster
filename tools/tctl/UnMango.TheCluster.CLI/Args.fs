module UnMango.TheCluster.CLI.Args

open Argu

// The alt names don't currently work
type Language =
    | [<CustomCommandLine("ts", "typescript")>] Typescript
    | [<CustomCommandLine("fs", "f#", "fsharp")>] FSharp

// The alt names don't currently work
type ProjectType =
    | [<CustomCommandLine("app", "apps")>] App
    | [<CustomCommandLine("cluster", "clusters")>] Cluster
    | [<CustomCommandLine("db")>] Database
    | [<CustomCommandLine("infra")>] Infrastructure

type New =
    | [<AltCommandLine("-c")>] Certificate of string list
    | [<AltCommandLine("--ca")>] CertificateAuthority
    | [<AltCommandLine("--helm")>] Chart
    | [<AltCommandLine("-f")>] Force
    | [<AltCommandLine("-l")>] Language of Language
    | [<AltCommandLine("-n")>] Name of string
    | [<AltCommandLine("--ns")>] Namespace of string
    | [<AltCommandLine("-o")>] OAuth
    | [<AltCommandLine("-s")>] Stack of string
    | [<AltCommandLine("-t")>] Trust of string list
    | [<MainCommand; ExactlyOnce>] Type of ProjectType

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
            | Stack _ -> "Override the stack name"
            | Trust _ -> "Inject trust for the specified CAs"
            | Type _ -> "The type of the project"

type Root =
    | [<CliPrefix(CliPrefix.None)>] New of ParseResults<New>

    interface IArgParserTemplate with
        member arg.Usage =
            match arg with
            | New _ -> "Create a new THECLUSTER project"
