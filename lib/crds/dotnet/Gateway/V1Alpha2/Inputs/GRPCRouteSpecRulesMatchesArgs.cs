// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2
{

    /// <summary>
    /// GRPCRouteMatch defines the predicate used to match requests to a given action. Multiple match types are ANDed together, i.e. the match will evaluate to true only if all conditions are satisfied. 
    ///  For example, the match below will match a gRPC request only if its service is `foo` AND it contains the `version: v1` header: 
    ///  ``` matches: - method: type: Exact service: "foo" headers: - name: "version" value "v1" 
    ///  ```
    /// </summary>
    public class GRPCRouteSpecRulesMatchesArgs : global::Pulumi.ResourceArgs
    {
        [Input("headers")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.GRPCRouteSpecRulesMatchesHeadersArgs>? _headers;

        /// <summary>
        /// Headers specifies gRPC request header matchers. Multiple match values are ANDed together, meaning, a request MUST match all the specified headers to select the route.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.GRPCRouteSpecRulesMatchesHeadersArgs> Headers
        {
            get => _headers ?? (_headers = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.GRPCRouteSpecRulesMatchesHeadersArgs>());
            set => _headers = value;
        }

        /// <summary>
        /// Method specifies a gRPC request service/method matcher. If this field is not specified, all services and methods will match.
        /// </summary>
        [Input("method")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.GRPCRouteSpecRulesMatchesMethodArgs>? Method { get; set; }

        public GRPCRouteSpecRulesMatchesArgs()
        {
        }
        public static new GRPCRouteSpecRulesMatchesArgs Empty => new GRPCRouteSpecRulesMatchesArgs();
    }
}
