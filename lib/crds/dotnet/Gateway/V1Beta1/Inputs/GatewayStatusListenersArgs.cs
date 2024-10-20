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
    /// ListenerStatus is the status associated with a Listener.
    /// </summary>
    public class GatewayStatusListenersArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// AttachedRoutes represents the total number of Routes that have been successfully attached to this Listener. 
        ///  Successful attachment of a Route to a Listener is based solely on the combination of the AllowedRoutes field on the corresponding Listener and the Route's ParentRefs field. A Route is successfully attached to a Listener when it is selected by the Listener's AllowedRoutes field AND the Route has a valid ParentRef selecting the whole Gateway resource or a specific Listener as a parent resource (more detail on attachment semantics can be found in the documentation on the various Route kinds ParentRefs fields). Listener or Route status does not impact successful attachment, i.e. the AttachedRoutes field count MUST be set for Listeners with condition Accepted: false and MUST count successfully attached Routes that may themselves have Accepted: false conditions. 
        ///  Uses for this field include troubleshooting Route attachment and measuring blast radius/impact of changes to a Listener.
        /// </summary>
        [Input("attachedRoutes", required: true)]
        public Input<int> AttachedRoutes { get; set; } = null!;

        [Input("conditions", required: true)]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions describe the current condition of this listener.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersConditionsArgs>());
            set => _conditions = value;
        }

        /// <summary>
        /// Name is the name of the Listener that this status corresponds to.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        [Input("supportedKinds", required: true)]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersSupportedKindsArgs>? _supportedKinds;

        /// <summary>
        /// SupportedKinds is the list indicating the Kinds supported by this listener. This MUST represent the kinds an implementation supports for that Listener configuration. 
        ///  If kinds are specified in Spec that are not supported, they MUST NOT appear in this list and an implementation MUST set the "ResolvedRefs" condition to "False" with the "InvalidRouteKinds" reason. If both valid and invalid Route kinds are specified, the implementation MUST reference the valid Route kinds that have been specified.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersSupportedKindsArgs> SupportedKinds
        {
            get => _supportedKinds ?? (_supportedKinds = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusListenersSupportedKindsArgs>());
            set => _supportedKinds = value;
        }

        public GatewayStatusListenersArgs()
        {
        }
        public static new GatewayStatusListenersArgs Empty => new GatewayStatusListenersArgs();
    }
}
