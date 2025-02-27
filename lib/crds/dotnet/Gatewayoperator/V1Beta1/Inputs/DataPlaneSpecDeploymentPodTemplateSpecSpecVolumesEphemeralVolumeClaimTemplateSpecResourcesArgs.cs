// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// resources represents the minimum resources the volume should have. If RecoverVolumeExpansionFailure feature is enabled users are allowed to specify resource requirements that are lower than previous value but must still be higher than capacity recorded in the status field of the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#resources
    /// </summary>
    public class DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesArgs : global::Pulumi.ResourceArgs
    {
        [Input("claims")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesClaimsArgs>? _claims;

        /// <summary>
        /// Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container. 
        ///  This is an alpha field and requires enabling the DynamicResourceAllocation feature gate. 
        ///  This field is immutable. It can only be set for containers.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesClaimsArgs> Claims
        {
            get => _claims ?? (_claims = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesClaimsArgs>());
            set => _claims = value;
        }

        [Input("limits")]
        private InputMap<Union<int, string>>? _limits;

        /// <summary>
        /// Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
        /// </summary>
        public InputMap<Union<int, string>> Limits
        {
            get => _limits ?? (_limits = new InputMap<Union<int, string>>());
            set => _limits = value;
        }

        [Input("requests")]
        private InputMap<Union<int, string>>? _requests;

        /// <summary>
        /// Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
        /// </summary>
        public InputMap<Union<int, string>> Requests
        {
            get => _requests ?? (_requests = new InputMap<Union<int, string>>());
            set => _requests = value;
        }

        public DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesArgs()
        {
        }
        public static new DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesArgs Empty => new DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesEphemeralVolumeClaimTemplateSpecResourcesArgs();
    }
}
