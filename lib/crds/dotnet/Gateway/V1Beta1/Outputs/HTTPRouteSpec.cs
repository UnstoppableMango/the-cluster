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
    /// Spec defines the desired state of HTTPRoute.
    /// </summary>
    [OutputType]
    public sealed class HTTPRouteSpec
    {
        /// <summary>
        /// Hostnames defines a set of hostnames that should match against the HTTP Host header to select a HTTPRoute used to process the request. Implementations MUST ignore any port value specified in the HTTP Host header while performing a match and (absent of any applicable header modification configuration) MUST forward this header unmodified to the backend. 
        ///  Valid values for Hostnames are determined by RFC 1123 definition of a hostname with 2 notable exceptions: 
        ///  1. IPs are not allowed. 2. A hostname may be prefixed with a wildcard label (`*.`). The wildcard label must appear by itself as the first label. 
        ///  If a hostname is specified by both the Listener and HTTPRoute, there must be at least one intersecting hostname for the HTTPRoute to be attached to the Listener. For example: 
        ///  * A Listener with `test.example.com` as the hostname matches HTTPRoutes that have either not specified any hostnames, or have specified at least one of `test.example.com` or `*.example.com`. * A Listener with `*.example.com` as the hostname matches HTTPRoutes that have either not specified any hostnames or have specified at least one hostname that matches the Listener hostname. For example, `*.example.com`, `test.example.com`, and `foo.test.example.com` would all match. On the other hand, `example.com` and `test.example.net` would not match. 
        ///  Hostnames that are prefixed with a wildcard label (`*.`) are interpreted as a suffix match. That means that a match for `*.example.com` would match both `test.example.com`, and `foo.test.example.com`, but not `example.com`. 
        ///  If both the Listener and HTTPRoute have specified hostnames, any HTTPRoute hostnames that do not match the Listener hostname MUST be ignored. For example, if a Listener specified `*.example.com`, and the HTTPRoute specified `test.example.com` and `test.example.net`, `test.example.net` must not be considered for a match. 
        ///  If both the Listener and HTTPRoute have specified hostnames, and none match with the criteria above, then the HTTPRoute is not accepted. The implementation must raise an 'Accepted' Condition with a status of `False` in the corresponding RouteParentStatus. 
        ///  In the event that multiple HTTPRoutes specify intersecting hostnames (e.g. overlapping wildcard matching and exact matching hostnames), precedence must be given to rules from the HTTPRoute with the largest number of: 
        ///  * Characters in a matching non-wildcard hostname. * Characters in a matching hostname. 
        ///  If ties exist across multiple Routes, the matching precedence rules for HTTPRouteMatches takes over. 
        ///  Support: Core
        /// </summary>
        public readonly ImmutableArray<string> Hostnames;
        /// <summary>
        /// ParentRefs references the resources (usually Gateways) that a Route wants to be attached to. Note that the referenced parent resource needs to allow this for the attachment to be complete. For Gateways, that means the Gateway needs to allow attachment from Routes of this kind and namespace. For Services, that means the Service must either be in the same namespace for a "producer" route, or the mesh implementation must support and allow "consumer" routes for the referenced Service. ReferenceGrant is not applicable for governing ParentRefs to Services - it is not possible to create a "producer" route for a Service in a different namespace from the Route. 
        ///  There are two kinds of parent resources with "Core" support: 
        ///  * Gateway (Gateway conformance profile)  * Service (Mesh conformance profile, experimental, ClusterIP Services only)  This API may be extended in the future to support additional kinds of parent resources. 
        ///  ParentRefs must be _distinct_. This means either that: 
        ///  * They select different objects.  If this is the case, then parentRef entries are distinct. In terms of fields, this means that the multi-part key defined by `group`, `kind`, `namespace`, and `name` must be unique across all parentRef entries in the Route. * They do not select different objects, but for each optional field used, each ParentRef that selects the same object must set the same set of optional fields to different values. If one ParentRef sets a combination of optional fields, all must set the same combination. 
        ///  Some examples: 
        ///  * If one ParentRef sets `sectionName`, all ParentRefs referencing the same object must also set `sectionName`. * If one ParentRef sets `port`, all ParentRefs referencing the same object must also set `port`. * If one ParentRef sets `sectionName` and `port`, all ParentRefs referencing the same object must also set `sectionName` and `port`. 
        ///  It is possible to separately reference multiple distinct objects that may be collapsed by an implementation. For example, some implementations may choose to merge compatible Gateway Listeners together. If that is the case, the list of routes attached to those resources should also be merged. 
        ///  Note that for ParentRefs that cross namespace boundaries, there are specific rules. Cross-namespace references are only valid if they are explicitly allowed by something in the namespace they are referring to. For example, Gateway has the AllowedRoutes field, and ReferenceGrant provides a generic way to enable other kinds of cross-namespace reference. 
        ///   ParentRefs from a Route to a Service in the same namespace are "producer" routes, which apply default routing rules to inbound connections from any namespace to the Service. 
        ///  ParentRefs from a Route to a Service in a different namespace are "consumer" routes, and these routing rules are only applied to outbound connections originating from the same namespace as the Route, for which the intended destination of the connections are a Service targeted as a ParentRef of the Route.  
        ///  
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteSpecParentRefs> ParentRefs;
        /// <summary>
        /// Rules are a list of HTTP matchers, filters and actions.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteSpecRules> Rules;

        [OutputConstructor]
        private HTTPRouteSpec(
            ImmutableArray<string> hostnames,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteSpecParentRefs> parentRefs,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.HTTPRouteSpecRules> rules)
        {
            Hostnames = hostnames;
            ParentRefs = parentRefs;
            Rules = rules;
        }
    }
}