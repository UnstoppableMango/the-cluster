// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecSideCarsVolumesEphemeralVolumeClaimTemplateArgs : global::Pulumi.ResourceArgs
    {
        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesEphemeralVolumeClaimTemplateMetadataArgs>? Metadata { get; set; }

        [Input("spec", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecSideCarsVolumesEphemeralVolumeClaimTemplateSpecArgs> Spec { get; set; } = null!;

        public TenantSpecSideCarsVolumesEphemeralVolumeClaimTemplateArgs()
        {
        }
        public static new TenantSpecSideCarsVolumesEphemeralVolumeClaimTemplateArgs Empty => new TenantSpecSideCarsVolumesEphemeralVolumeClaimTemplateArgs();
    }
}