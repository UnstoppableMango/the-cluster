// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1
{

    /// <summary>
    /// URLRewrite defines a schema for a filter that modifies a request during forwarding. 
    ///  Support: Extended
    /// </summary>
    public class HTTPRouteSpecRulesBackendRefsFiltersUrlRewriteArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Hostname is the value to be used to replace the Host header value during forwarding. 
        ///  Support: Extended
        /// </summary>
        [Input("hostname")]
        public Input<string>? Hostname { get; set; }

        /// <summary>
        /// Path defines a path rewrite. 
        ///  Support: Extended
        /// </summary>
        [Input("path")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersUrlRewritePathArgs>? Path { get; set; }

        public HTTPRouteSpecRulesBackendRefsFiltersUrlRewriteArgs()
        {
        }
        public static new HTTPRouteSpecRulesBackendRefsFiltersUrlRewriteArgs Empty => new HTTPRouteSpecRulesBackendRefsFiltersUrlRewriteArgs();
    }
}