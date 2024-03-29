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
    /// HTTPRouteMatch defines the predicate used to match requests to a given action. Multiple match types are ANDed together, i.e. the match will evaluate to true only if all conditions are satisfied. 
    ///  For example, the match below will match a HTTP request only if its path starts with `/foo` AND it contains the `version: v1` header: 
    ///  ``` match: 
    ///  path: value: "/foo" headers: - name: "version" value "v1" 
    ///  ```
    /// </summary>
    [OutputType]
    public sealed class HTTPRouteSpecRulesMatches
    {
        /// <summary>
        /// Headers specifies HTTP request header matchers. Multiple match values are ANDed together, meaning, a request must match all the specified headers to select the route.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpecRulesMatchesHeaders> Headers;
        /// <summary>
        /// Method specifies HTTP method matcher. When specified, this route will be matched only if the request has the specified method. 
        ///  Support: Extended
        /// </summary>
        public readonly string Method;
        /// <summary>
        /// Path specifies a HTTP request path matcher. If this field is not specified, a default prefix match on the "/" path is provided.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpecRulesMatchesPath Path;
        /// <summary>
        /// QueryParams specifies HTTP query parameter matchers. Multiple match values are ANDed together, meaning, a request must match all the specified query parameters to select the route. 
        ///  Support: Extended
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpecRulesMatchesQueryParams> QueryParams;

        [OutputConstructor]
        private HTTPRouteSpecRulesMatches(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpecRulesMatchesHeaders> headers,

            string method,

            Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpecRulesMatchesPath path,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpecRulesMatchesQueryParams> queryParams)
        {
            Headers = headers;
            Method = method;
            Path = path;
            QueryParams = queryParams;
        }
    }
}
