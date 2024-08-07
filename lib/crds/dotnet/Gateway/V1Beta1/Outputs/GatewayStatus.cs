// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1
{

    /// <summary>
    /// Status defines the current state of Gateway.
    /// </summary>
    [OutputType]
    public sealed class GatewayStatus
    {
        /// <summary>
        /// Addresses lists the network addresses that have been bound to the Gateway. 
        ///  This list may differ from the addresses provided in the spec under some conditions: 
        ///  * no addresses are specified, all addresses are dynamically assigned * a combination of specified and dynamic addresses are assigned * a specified address was unusable (e.g. already in use) 
        ///  
        /// </summary>
        public readonly ImmutableArray<object> Addresses;
        /// <summary>
        /// Conditions describe the current conditions of the Gateway. 
        ///  Implementations should prefer to express Gateway conditions using the `GatewayConditionType` and `GatewayConditionReason` constants so that operators and tools can converge on a common vocabulary to describe Gateway state. 
        ///  Known condition types are: 
        ///  * "Accepted" * "Programmed" * "Ready"
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewayStatusConditions> Conditions;
        /// <summary>
        /// Listeners provide status for each unique listener port defined in the Spec.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewayStatusListeners> Listeners;

        [OutputConstructor]
        private GatewayStatus(
            ImmutableArray<object> addresses,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewayStatusConditions> conditions,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewayStatusListeners> listeners)
        {
            Addresses = addresses;
            Conditions = conditions;
            Listeners = listeners;
        }
    }
}
