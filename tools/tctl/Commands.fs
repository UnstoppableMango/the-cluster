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
          Lang: Result<Language, string>
          Stack: string option
          Trust: string list
          Type: Result<ProjectType, string> }

        static member Empty() =
            { Certificates = []
              CertificateAuthority = false
              Chart = false
              Force = false
              Name = None
              Namespace = None
              OAuth = false
              Lang = Ok Typescript
              Stack = None
              Trust = []
              Type = Error "Type is required" }

    module Opts =
        let folder p c : Parsed =
            match c with
            | Certificate certs -> { p with Certificates = certs }
            | CertificateAuthority -> { p with CertificateAuthority = true }
            | Chart -> { p with Chart = true }
            | Force -> { p with Force = true }
            | Language lang -> { p with Lang = Lang.parse lang }
            | Name name -> { p with Name = Some name }
            | Namespace ns -> { p with Namespace = ns }
            | OAuth -> { p with OAuth = true }
            | Trust trust -> { p with Trust = trust }
            | Type t -> { p with Type = ProjectType.parse t }

        let parse =
            Seq.fold folder (Parsed.Empty())
            >> function
                | { Parsed.Force = force
                    Name = name
                    Lang = Ok lang
                    Stack = stack
                    Type = Ok t } ->
                    Ok
                        { New.Opts.Force = force
                          New.Opts.Name = name
                          New.Opts.Lang = lang
                          New.Opts.Stack = stack
                          New.Opts.Type = t }
                | { Type = Error msg } -> Error msg
                | { Lang = Error msg } -> Error msg

    let consume (results: ParseResults<NewArgs>) =
        function
        | Ok(opts: New.Opts) -> Project.create opts
        | Error(msg: string) -> results.Raise(msg, ErrorCode.CommandLine)

    let run (args: ParseResults<NewArgs>) =
        args.GetAllResults() |> Opts.parse |> consume args

module Root =
    let run =
        function
        | New args -> New.run args
