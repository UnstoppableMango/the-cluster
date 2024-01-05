module UnMango.TheCluster.CLI.Commands

open Argu

type New =
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

module New =
    let from (args: ParseResults<NewArgs>) =
        { Certificates = args.GetResult NewArgs.Certificate
          CertificateAuthority = args.Contains NewArgs.CertificateAuthority
          Chart = args.Contains NewArgs.Chart
          Force = args.Contains NewArgs.Force
          Name = args.TryGetResult NewArgs.Name
          Namespace = args.TryGetResult NewArgs.Namespace
          OAuth = args.Contains NewArgs.OAuth
          Lang = args.GetResult NewArgs.Language
          Stack = args.TryGetResult NewArgs.Stack
          Trust = args.GetResult NewArgs.Trust
          Type = args.GetResult NewArgs.Type }
