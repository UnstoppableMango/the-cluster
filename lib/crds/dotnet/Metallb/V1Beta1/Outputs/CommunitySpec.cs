// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Metallb.V1Beta1
{

    /// <summary>
    /// CommunitySpec defines the desired state of Community.
    /// </summary>
    [OutputType]
    public sealed class CommunitySpec
    {
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Metallb.V1Beta1.CommunitySpecCommunities> Communities;

        [OutputConstructor]
        private CommunitySpec(ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Metallb.V1Beta1.CommunitySpecCommunities> communities)
        {
            Communities = communities;
        }
    }
}
