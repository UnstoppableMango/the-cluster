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
    /// Path specifies a HTTP request path matcher. If this field is not specified, a default prefix match on the "/" path is provided.
    /// </summary>
    [OutputType]
    public sealed class HTTPRouteSpecRulesMatchesPath
    {
        /// <summary>
        /// Type specifies how to match against the path Value. 
        ///  Support: Core (Exact, PathPrefix) 
        ///  Support: Implementation-specific (RegularExpression)
        /// </summary>
        public readonly string Type;
        /// <summary>
        /// Value of the HTTP path to match against.
        /// </summary>
        public readonly string Value;

        [OutputConstructor]
        private HTTPRouteSpecRulesMatchesPath(
            string type,

            string value)
        {
            Type = type;
            Value = value;
        }
    }
}