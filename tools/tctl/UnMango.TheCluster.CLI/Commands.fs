module UnMango.TheCluster.CLI.Commands

open Argu
open UnMango.TheCluster.CLI.Args

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
        { Certificates = args.GetResult New.Certificate
          CertificateAuthority = args.Contains New.CertificateAuthority
          Chart = args.Contains New.Chart
          Force = args.Contains New.Force
          Name = args.TryGetResult New.Name
          Namespace = args.TryGetResult New.Namespace
          OAuth = args.Contains New.OAuth
          Lang = args.GetResult New.Language
          Stack = args.TryGetResult New.Stack
          Trust = args.GetResult New.Trust
          Type = args.GetResult New.Type }
