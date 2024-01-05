module UnMango.TheCluster.CLI.Commands

open Argu

module New =
    type Parsed =
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

        static member Empty() =
            { Certificates = []
              CertificateAuthority = false
              Chart = false
              Force = false
              Name = None
              Namespace = None
              OAuth = false
              Lang = Typescript
              Stack = None
              Trust = []
              Type = App }

    module Opts =
        let folder p c : Parsed =
            match c with
            | Certificate certs -> { p with Certificates = certs }
            | CertificateAuthority -> { p with CertificateAuthority = true }
            | Chart -> { p with Chart = true }
            | Force -> { p with Force = true }
            | Language lang -> { p with Lang = lang }
            | Name name -> { p with Name = Some name }
            | Namespace ns -> { p with Namespace = ns }
            | OAuth -> { p with OAuth = true }
            | Trust trust -> { p with Trust = trust }
            | Type t -> { p with Type = t }

        let parse (args: NewArgs seq) =
            Seq.fold folder (Parsed.Empty()) args
            |> function
                | { Parsed.Force = force
                    Name = name
                    Lang = lang
                    Stack = stack
                    Type = t } ->
                    { New.Opts.Force = force
                      New.Opts.Name = name
                      New.Opts.Lang = lang
                      New.Opts.Stack = stack
                      New.Opts.Type = t }
                    |> Ok

    let consume (results: ParseResults<NewArgs>) =
        function
        | Ok(opts: New.Opts) -> Project.create opts
        | Error(msg: string) -> results.Raise(msg, ErrorCode.CommandLine)
