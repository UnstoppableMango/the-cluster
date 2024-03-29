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
    /// GatewayConfigurationStatus defines the observed state of GatewayConfiguration
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationStatus
    {
        /// <summary>
        /// Conditions describe the current conditions of the GatewayConfigurationStatus.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationStatusConditions> Conditions;

        [OutputConstructor]
        private GatewayConfigurationStatus(ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationStatusConditions> conditions)
        {
            Conditions = conditions;
        }
    }
}
