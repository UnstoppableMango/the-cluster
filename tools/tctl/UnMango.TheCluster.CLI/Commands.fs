module UnMango.TheCluster.CLI.Commands

open System
open System.Threading.Tasks
open Argu
open UnMango.TheCluster.CLI.Args

let (|AnyUnrecognized|_|) (args: ParseResults<'a>) =
    if args.UnrecognizedCliParams.Length > 0 then
        Some args.UnrecognizedCliParams
    else
        None

let (|ShouldShowUsage|_|) (args: ParseResults<'a>) =
    if args.IsUsageRequested then Some ShouldShowUsage else None

let handleUnrecognized (args: 'a seq) =
    Console.WriteLine("Unrecognized arguments: {0}", args)
    |> (fun _ -> Task.FromResult(1))

let showUsage (args: ParseResults<'a>) =
    args.Parser.PrintUsage() |> Console.WriteLine |> (fun _ -> Task.FromResult(0))

let resultCode =
    function
    | Ok _ -> 0
    | Error _ -> 1

type NewProject =
    { Certificates: string list
      CertificateAuthority: bool
      Chart: bool
      Force: bool
      Name: string option
      Namespace: string option
      OAuth: bool
      Lang: Language
      Stack: string option
      Trust: string list
      Type: ProjectType }

module NewProject =
    let from (args: ParseResults<Args.New>) : NewProject =
        { Certificates = args.GetResult(New.Certificate, [])
          CertificateAuthority = args.Contains New.CertificateAuthority
          Chart = args.Contains New.Chart
          Force = args.Contains New.Force
          Name = args.TryGetResult New.Name
          Namespace = args.TryGetResult New.Namespace
          OAuth = args.Contains New.OAuth
          Lang = args.GetResult(New.Language, Language.Typescript)
          Stack = args.TryGetResult New.Stack
          Trust = args.GetResult(New.Trust, [])
          Type = args.GetResult New.Type }
