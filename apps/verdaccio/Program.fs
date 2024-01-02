module Program

open System.IO
open Pulumi
open Pulumi.FSharp
open Pulumi.Kubernetes.Helm
open Pulumi.Kubernetes.Helm.V3
open UnMango.TheCluster.FSharp

let infra () =
    let config = Config()
    let opts = TheCluster.OptsFromStack()

    let ns = K8s.ns opts "verdaccio"

    let cm =
        K8s.cm
            opts
            "verdaccio-verdaccio"
            (ns.Metadata |> Outputs.apply _.Name |> io)
            (inputMap [ "config.yaml", File.ReadAllTextAsync("assets/config.yaml") |> Output.Create<string> |> io ])

    let chart =
        Chart(
            "verdaccio",
            LocalChartArgs(
                Path = "./",
                SkipCRDRendering = false,
                Namespace = (ns.Metadata |> Outputs.apply (_.Name) |> io),
                Values =
                    inputMap<obj>
                        [ "verdaccio",
                          input<obj>
                              {| image =
                                  {| repository = "verdaccio/verdaccio"
                                     tag = "5.21.1" |}
                                 service = {| ``type`` = "ClusterIP" |}
                                 replicaCount = 2
                                 existingConfigMap = "config" |} ]
            ),
            ComponentResourceOptions(Provider = opts.Provider)
        )

    dict [ "namespace", ns.Metadata |> Outputs.apply (_.Name) :> obj ]

[<EntryPoint>]
let main _ = Deployment.run infra
