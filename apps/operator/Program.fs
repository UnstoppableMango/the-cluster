module Program

open System.Collections.Generic
open Pulumi
open Pulumi.FSharp
open Pulumi.Kubernetes.Core.V1
open Pulumi.Kubernetes.Helm
open Pulumi.Kubernetes.Helm.V3
open UnMango.TheCluster.FSharp

let infra () : IDictionary<string, obj> =
    let provider = ClusterProvider.FromStack()

    let chart =
        Chart(
            "thecluster",
            LocalChartArgs(
                Path = "../../charts/thecluster-operator",
                SkipCRDRendering = false,
                Values = Ops.inputMap [ "thecluster-operator", Ops.input [] ]
            ),
            ComponentResourceOptions(Provider = provider)
        )

    let namespaceName =
        chart.GetResource<Namespace>("thecluster-system")
        |> Outputs.bind (_.Metadata)
        |> Outputs.apply (_.Name)

    dict [ "namespace", namespaceName ]

[<EntryPoint>]
let main _ = Deployment.run infra
