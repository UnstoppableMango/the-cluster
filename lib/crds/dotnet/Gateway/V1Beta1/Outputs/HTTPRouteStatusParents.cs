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
    /// RouteParentStatus describes the status of a route with respect to an associated Parent.
    /// </summary>
    [OutputType]
    public sealed class HTTPRouteStatusParents
    {
        /// <summary>
        /// Conditions describes the status of the route with respect to the Gateway. Note that the route's availability is also subject to the Gateway's own status conditions and listener status. 
        ///  If the Route's ParentRef specifies an existing Gateway that supports Routes of this kind AND that Gateway's controller has sufficient access, then that Gateway's controller MUST set the "Accepted" condition on the Route, to indicate whether the route has been accepted or rejected by the Gateway, and why. 
        ///  A Route MUST be considered "Accepted" if at least one of the Route's rules is implemented by the Gateway. 
        ///  There are a number of cases where the "Accepted" condition may not be set due to lack of controller visibility, that includes when: 
        ///  * The Route refers to a non-existent parent. * The Route is of a type that the controller does not support. * The Route is in a namespace the controller does not have access to.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteStatusParentsConditions> Conditions;
        /// <summary>
        /// ControllerName is a domain/path string that indicates the name of the controller that wrote this status. This corresponds with the controllerName field on GatewayClass. 
        ///  Example: "example.net/gateway-controller". 
        ///  The format of this field is DOMAIN "/" PATH, where DOMAIN and PATH are valid Kubernetes names (https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names). 
        ///  Controllers MUST populate this field when writing status. Controllers should ensure that entries to status populated with their ControllerName are cleaned up when they are no longer necessary.
        /// </summary>
        public readonly string ControllerName;
        /// <summary>
        /// ParentRef corresponds with a ParentRef in the spec that this RouteParentStatus struct describes the status of.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteStatusParentsParentRef ParentRef;

        [OutputConstructor]
        private HTTPRouteStatusParents(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteStatusParentsConditions> conditions,

            string controllerName,

            Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteStatusParentsParentRef parentRef)
        {
            Conditions = conditions;
            ControllerName = controllerName;
            ParentRef = parentRef;
        }
    }
}