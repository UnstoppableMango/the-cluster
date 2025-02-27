// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gateway.V1
{

    /// <summary>
    /// AllowedRoutes defines the types of routes that MAY be attached to a Listener and the trusted namespaces where those Route resources MAY be present. 
    ///  Although a client request may match multiple route rules, only one rule may ultimately receive the request. Matching precedence MUST be determined in order of the following criteria: 
    ///  * The most specific match as defined by the Route type. * The oldest Route based on creation timestamp. For example, a Route with a creation timestamp of "2020-09-08 01:02:03" is given precedence over a Route with a creation timestamp of "2020-09-08 01:02:04". * If everything else is equivalent, the Route appearing first in alphabetical order (namespace/name) should be given precedence. For example, foo/bar is given precedence over foo/baz. 
    ///  All valid rules within a Route attached to this Listener should be implemented. Invalid Route rules can be ignored (sometimes that will mean the full Route). If a Route rule transitions from valid to invalid, support for that Route rule should be dropped to ensure consistency. For example, even if a filter specified by a Route rule is invalid, the rest of the rules within that Route should still be supported. 
    ///  Support: Core
    /// </summary>
    [OutputType]
    public sealed class GatewaySpecListenersAllowedRoutes
    {
        /// <summary>
        /// Kinds specifies the groups and kinds of Routes that are allowed to bind to this Gateway Listener. When unspecified or empty, the kinds of Routes selected are determined using the Listener protocol. 
        ///  A RouteGroupKind MUST correspond to kinds of Routes that are compatible with the application protocol specified in the Listener's Protocol field. If an implementation does not support or recognize this resource type, it MUST set the "ResolvedRefs" condition to False for this Listener with the "InvalidRouteKinds" reason. 
        ///  Support: Core
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.GatewaySpecListenersAllowedRoutesKinds> Kinds;
        /// <summary>
        /// Namespaces indicates namespaces from which Routes may be attached to this Listener. This is restricted to the namespace of this Gateway by default. 
        ///  Support: Core
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gateway.V1.GatewaySpecListenersAllowedRoutesNamespaces Namespaces;

        [OutputConstructor]
        private GatewaySpecListenersAllowedRoutes(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.GatewaySpecListenersAllowedRoutesKinds> kinds,

            Pulumi.Kubernetes.Types.Outputs.Gateway.V1.GatewaySpecListenersAllowedRoutesNamespaces namespaces)
        {
            Kinds = kinds;
            Namespaces = namespaces;
        }
    }
}
