// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsVolumeClaimTemplatesStatusConditionsArgs : global::Pulumi.ResourceArgs
    {
        [Input("lastProbeTime")]
        public Input<string>? LastProbeTime { get; set; }

        [Input("lastTransitionTime")]
        public Input<string>? LastTransitionTime { get; set; }

        [Input("message")]
        public Input<string>? Message { get; set; }

        [Input("reason")]
        public Input<string>? Reason { get; set; }

        [Input("status", required: true)]
        public Input<string> Status { get; set; } = null!;

        [Input("type", required: true)]
        public Input<string> Type { get; set; } = null!;

        public TenantSpecSideCarsVolumeClaimTemplatesStatusConditionsArgs()
        {
        }
        public static new TenantSpecSideCarsVolumeClaimTemplatesStatusConditionsArgs Empty => new TenantSpecSideCarsVolumeClaimTemplatesStatusConditionsArgs();
    }
}