namespace UnMango.TheCluster.FSharp

open System
open Pulumi
open Pulumi.Kubernetes

module ClusterProvider =
    let forCluster name =
        StackRef.cluster name
        |> StackRef.requireObject<string> "kubeconfig"
        |> (fun k -> Provider(name, ProviderArgs(KubeConfig = k)))

type ClusterProvider() =
    static member FromStack() =
        Environment.GetEnvironmentVariable("PULUMI_STACK") |> ClusterProvider.forCluster

    static member FromConfig() =
        Config().Require("clusterName") |> ClusterProvider.forCluster
