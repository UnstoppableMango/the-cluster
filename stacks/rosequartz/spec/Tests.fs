module Tests

open Xunit
open System
open System.IO
open k8s

module String =
    let defaultNullOrEmpty d v =
        if String.IsNullOrEmpty(v) then d else v

module K8s =
    let listNode (client: Kubernetes) = client.CoreV1.ListNodeAsync()

    let version (client: Kubernetes) = client.Version.GetCodeAsync()

let getK8s =
    Environment.GetEnvironmentVariable("ROSEQUARTZ_KUBECONFIG")
    |> KubernetesClientConfiguration.BuildConfigFromConfigFile
    |> fun x -> new Kubernetes(x)

[<Fact>]
let ``Cluster is accessible`` () =
    task {
        let! nodes = getK8s |> K8s.listNode

        Assert.NotEmpty(nodes.Items)
    }

[<Fact>]
let ``Should have node name configured properly`` () =
    task {
        let! nodes = getK8s |> K8s.listNode

        let node = Assert.Single(nodes.Items)
        Assert.Equal("rqctrl1", node.Metadata.Name)
    }

[<Fact>]
let ``Should have correct kubernetes version`` () =
    task {
        let! expected = File.ReadAllTextAsync(".versions/k8s")

        let! version = getK8s |> K8s.version

        Assert.Equal("1.28.1", version.GitVersion)
    }
