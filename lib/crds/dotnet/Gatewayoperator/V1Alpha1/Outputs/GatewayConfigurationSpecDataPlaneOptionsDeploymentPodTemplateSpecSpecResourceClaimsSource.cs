// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// Source describes where to find the ResourceClaim.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecResourceClaimsSource
    {
        /// <summary>
        /// ResourceClaimName is the name of a ResourceClaim object in the same namespace as this pod.
        /// </summary>
        public readonly string ResourceClaimName;
        /// <summary>
        /// ResourceClaimTemplateName is the name of a ResourceClaimTemplate object in the same namespace as this pod. 
        ///  The template will be used to create a new ResourceClaim, which will be bound to this pod. When this pod is deleted, the ResourceClaim will also be deleted. The pod name and resource name, along with a generated component, will be used to form a unique name for the ResourceClaim, which will be recorded in pod.status.resourceClaimStatuses. 
        ///  This field is immutable and no changes will be made to the corresponding ResourceClaim by the control plane after creating the ResourceClaim.
        /// </summary>
        public readonly string ResourceClaimTemplateName;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecResourceClaimsSource(
            string resourceClaimName,

            string resourceClaimTemplateName)
        {
            ResourceClaimName = resourceClaimName;
            ResourceClaimTemplateName = resourceClaimTemplateName;
        }
    }
}