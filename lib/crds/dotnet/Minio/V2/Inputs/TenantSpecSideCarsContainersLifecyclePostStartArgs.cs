// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsContainersLifecyclePostStartArgs : global::Pulumi.ResourceArgs
    {
        [Input("exec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsContainersLifecyclePostStartExecArgs>? Exec { get; set; }

        [Input("httpGet")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsContainersLifecyclePostStartHttpGetArgs>? HttpGet { get; set; }

        [Input("tcpSocket")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsContainersLifecyclePostStartTcpSocketArgs>? TcpSocket { get; set; }

        public TenantSpecSideCarsContainersLifecyclePostStartArgs()
        {
        }
        public static new TenantSpecSideCarsContainersLifecyclePostStartArgs Empty => new TenantSpecSideCarsContainersLifecyclePostStartArgs();
    }
}