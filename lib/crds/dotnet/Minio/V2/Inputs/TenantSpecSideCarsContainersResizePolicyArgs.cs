// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsContainersResizePolicyArgs : global::Pulumi.ResourceArgs
    {
        [Input("resourceName", required: true)]
        public Input<string> ResourceName { get; set; } = null!;

        [Input("restartPolicy", required: true)]
        public Input<string> RestartPolicy { get; set; } = null!;

        public TenantSpecSideCarsContainersResizePolicyArgs()
        {
        }
        public static new TenantSpecSideCarsContainersResizePolicyArgs Empty => new TenantSpecSideCarsContainersResizePolicyArgs();
    }
}
