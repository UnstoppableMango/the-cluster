// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecLoggingArgs : global::Pulumi.ResourceArgs
    {
        [Input("anonymous")]
        public Input<bool>? Anonymous { get; set; }

        [Input("json")]
        public Input<bool>? Json { get; set; }

        [Input("quiet")]
        public Input<bool>? Quiet { get; set; }

        public TenantSpecLoggingArgs()
        {
        }
        public static new TenantSpecLoggingArgs Empty => new TenantSpecLoggingArgs();
    }
}
