// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1
{

    /// <summary>
    /// Status defines the current state of Gateway.
    /// </summary>
    public class GatewayStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("addresses")]
        private InputList<object>? _addresses;

        /// <summary>
        /// Addresses lists the network addresses that have been bound to the Gateway. 
        ///  This list may differ from the addresses provided in the spec under some conditions: 
        ///  * no addresses are specified, all addresses are dynamically assigned * a combination of specified and dynamic addresses are assigned * a specified address was unusable (e.g. already in use) 
        ///  
        /// </summary>
        public InputList<object> Addresses
        {
            get => _addresses ?? (_addresses = new InputList<object>());
            set => _addresses = value;
        }

        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions describe the current conditions of the Gateway. 
        ///  Implementations should prefer to express Gateway conditions using the `GatewayConditionType` and `GatewayConditionReason` constants so that operators and tools can converge on a common vocabulary to describe Gateway state. 
        ///  Known condition types are: 
        ///  * "Accepted" * "Programmed" * "Ready"
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusConditionsArgs>());
            set => _conditions = value;
        }

        [Input("listeners")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersArgs>? _listeners;

        /// <summary>
        /// Listeners provide status for each unique listener port defined in the Spec.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersArgs> Listeners
        {
            get => _listeners ?? (_listeners = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersArgs>());
            set => _listeners = value;
        }

        public GatewayStatusArgs()
        {
        }
        public static new GatewayStatusArgs Empty => new GatewayStatusArgs();
    }
}