// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsContainersLifecycleArgs : global::Pulumi.ResourceArgs
    {
        [Input("postStart")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsContainersLifecyclePostStartArgs>? PostStart { get; set; }

        [Input("preStop")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsContainersLifecyclePreStopArgs>? PreStop { get; set; }

        public TenantSpecSideCarsContainersLifecycleArgs()
        {
        }
        public static new TenantSpecSideCarsContainersLifecycleArgs Empty => new TenantSpecSideCarsContainersLifecycleArgs();
    }
}
