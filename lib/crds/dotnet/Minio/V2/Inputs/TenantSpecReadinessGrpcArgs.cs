// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecReadinessGrpcArgs : global::Pulumi.ResourceArgs
    {
        [Input("port", required: true)]
        public Input<int> Port { get; set; } = null!;

        [Input("service")]
        public Input<string>? Service { get; set; }

        public TenantSpecReadinessGrpcArgs()
        {
        }
        public static new TenantSpecReadinessGrpcArgs Empty => new TenantSpecReadinessGrpcArgs();
    }
}
