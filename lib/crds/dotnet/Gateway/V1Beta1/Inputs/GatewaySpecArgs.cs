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
    /// Spec defines the desired state of Gateway.
    /// </summary>
    public class GatewaySpecArgs : global::Pulumi.ResourceArgs
    {
        [Input("addresses")]
        private InputList<object>? _addresses;

        /// <summary>
        /// Addresses requested for this Gateway. This is optional and behavior can depend on the implementation. If a value is set in the spec and the requested address is invalid or unavailable, the implementation MUST indicate this in the associated entry in GatewayStatus.Addresses. 
        ///  The Addresses field represents a request for the address(es) on the "outside of the Gateway", that traffic bound for this Gateway will use. This could be the IP address or hostname of an external load balancer or other networking infrastructure, or some other address that traffic will be sent to. 
        ///  If no Addresses are specified, the implementation MAY schedule the Gateway in an implementation-specific manner, assigning an appropriate set of Addresses. 
        ///  The implementation MUST bind all Listeners to every GatewayAddress that it assigns to the Gateway and add a corresponding entry in GatewayStatus.Addresses. 
        ///  Support: Extended 
        ///  
        /// </summary>
        public InputList<object> Addresses
        {
            get => _addresses ?? (_addresses = new InputList<object>());
            set => _addresses = value;
        }

        /// <summary>
        /// GatewayClassName used for this Gateway. This is the name of a GatewayClass resource.
        /// </summary>
        [Input("gatewayClassName", required: true)]
        public Input<string> GatewayClassName { get; set; } = null!;

        /// <summary>
        /// Infrastructure defines infrastructure level attributes about this Gateway instance. 
        ///  Support: Core 
        ///  
        /// </summary>
        [Input("infrastructure")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewaySpecInfrastructureArgs>? Infrastructure { get; set; }

        [Input("listeners", required: true)]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewaySpecListenersArgs>? _listeners;

        /// <summary>
        /// Listeners associated with this Gateway. Listeners define logical endpoints that are bound on this Gateway's addresses. At least one Listener MUST be specified. 
        ///  Each Listener in a set of Listeners (for example, in a single Gateway) MUST be _distinct_, in that a traffic flow MUST be able to be assigned to exactly one listener. (This section uses "set of Listeners" rather than "Listeners in a single Gateway" because implementations MAY merge configuration from multiple Gateways onto a single data plane, and these rules _also_ apply in that case). 
        ///  Practically, this means that each listener in a set MUST have a unique combination of Port, Protocol, and, if supported by the protocol, Hostname. 
        ///  Some combinations of port, protocol, and TLS settings are considered Core support and MUST be supported by implementations based on their targeted conformance profile: 
        ///  HTTP Profile 
        ///  1. HTTPRoute, Port: 80, Protocol: HTTP 2. HTTPRoute, Port: 443, Protocol: HTTPS, TLS Mode: Terminate, TLS keypair provided 
        ///  TLS Profile 
        ///  1. TLSRoute, Port: 443, Protocol: TLS, TLS Mode: Passthrough 
        ///  "Distinct" Listeners have the following property: 
        ///  The implementation can match inbound requests to a single distinct Listener. When multiple Listeners share values for fields (for example, two Listeners with the same Port value), the implementation can match requests to only one of the Listeners using other Listener fields. 
        ///  For example, the following Listener scenarios are distinct: 
        ///  1. Multiple Listeners with the same Port that all use the "HTTP" Protocol that all have unique Hostname values. 2. Multiple Listeners with the same Port that use either the "HTTPS" or "TLS" Protocol that all have unique Hostname values. 3. A mixture of "TCP" and "UDP" Protocol Listeners, where no Listener with the same Protocol has the same Port value. 
        ///  Some fields in the Listener struct have possible values that affect whether the Listener is distinct. Hostname is particularly relevant for HTTP or HTTPS protocols. 
        ///  When using the Hostname value to select between same-Port, same-Protocol Listeners, the Hostname value must be different on each Listener for the Listener to be distinct. 
        ///  When the Listeners are distinct based on Hostname, inbound request hostnames MUST match from the most specific to least specific Hostname values to choose the correct Listener and its associated set of Routes. 
        ///  Exact matches must be processed before wildcard matches, and wildcard matches must be processed before fallback (empty Hostname value) matches. For example, `"foo.example.com"` takes precedence over `"*.example.com"`, and `"*.example.com"` takes precedence over `""`. 
        ///  Additionally, if there are multiple wildcard entries, more specific wildcard entries must be processed before less specific wildcard entries. For example, `"*.foo.example.com"` takes precedence over `"*.example.com"`. The precise definition here is that the higher the number of dots in the hostname to the right of the wildcard character, the higher the precedence. 
        ///  The wildcard character will match any number of characters _and dots_ to the left, however, so `"*.example.com"` will match both `"foo.bar.example.com"` _and_ `"bar.example.com"`. 
        ///  If a set of Listeners contains Listeners that are not distinct, then those Listeners are Conflicted, and the implementation MUST set the "Conflicted" condition in the Listener Status to "True". 
        ///  Implementations MAY choose to accept a Gateway with some Conflicted Listeners only if they only accept the partial Listener set that contains no Conflicted Listeners. To put this another way, implementations may accept a partial Listener set only if they throw out *all* the conflicting Listeners. No picking one of the conflicting listeners as the winner. This also means that the Gateway must have at least one non-conflicting Listener in this case, otherwise it violates the requirement that at least one Listener must be present. 
        ///  The implementation MUST set a "ListenersNotValid" condition on the Gateway Status when the Gateway contains Conflicted Listeners whether or not they accept the Gateway. That Condition SHOULD clearly indicate in the Message which Listeners are conflicted, and which are Accepted. Additionally, the Listener status for those listeners SHOULD indicate which Listeners are conflicted and not Accepted. 
        ///  A Gateway's Listeners are considered "compatible" if: 
        ///  1. They are distinct. 2. The implementation can serve them in compliance with the Addresses requirement that all Listeners are available on all assigned addresses. 
        ///  Compatible combinations in Extended support are expected to vary across implementations. A combination that is compatible for one implementation may not be compatible for another. 
        ///  For example, an implementation that cannot serve both TCP and UDP listeners on the same address, or cannot mix HTTPS and generic TLS listens on the same port would not consider those cases compatible, even though they are distinct. 
        ///  Note that requests SHOULD match at most one Listener. For example, if Listeners are defined for "foo.example.com" and "*.example.com", a request to "foo.example.com" SHOULD only be routed using routes attached to the "foo.example.com" Listener (and not the "*.example.com" Listener). This concept is known as "Listener Isolation". Implementations that do not support Listener Isolation MUST clearly document this. 
        ///  Implementations MAY merge separate Gateways onto a single set of Addresses if all Listeners across all Gateways are compatible. 
        ///  Support: Core
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewaySpecListenersArgs> Listeners
        {
            get => _listeners ?? (_listeners = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewaySpecListenersArgs>());
            set => _listeners = value;
        }

        public GatewaySpecArgs()
        {
        }
        public static new GatewaySpecArgs Empty => new GatewaySpecArgs();
    }
}