// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantStatusUsageTiersArgs : global::Pulumi.ResourceArgs
    {
        [Input("Name", required: true)]
        public Input<string> Name { get; set; } = null!;

        [Input("Type")]
        public Input<string>? Type { get; set; }

        [Input("totalSize", required: true)]
        public Input<int> TotalSize { get; set; } = null!;

        public TenantStatusUsageTiersArgs()
        {
        }
        public static new TenantStatusUsageTiersArgs Empty => new TenantStatusUsageTiersArgs();
    }
}
