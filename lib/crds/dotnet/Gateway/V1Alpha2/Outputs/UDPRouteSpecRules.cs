// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gateway.V1Alpha2
{

    /// <summary>
    /// UDPRouteRule is the configuration for a given rule.
    /// </summary>
    [OutputType]
    public sealed class UDPRouteSpecRules
    {
        /// <summary>
        /// BackendRefs defines the backend(s) where matching requests should be sent. If unspecified or invalid (refers to a non-existent resource or a Service with no endpoints), the underlying implementation MUST actively reject connection attempts to this backend. Packet drops must respect weight; if an invalid backend is requested to have 80% of the packets, then 80% of packets must be dropped instead. 
        ///  Support: Core for Kubernetes Service 
        ///  Support: Extended for Kubernetes ServiceImport 
        ///  Support: Implementation-specific for any other resource 
        ///  Support for weight: Extended
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Alpha2.UDPRouteSpecRulesBackendRefs> BackendRefs;

        [OutputConstructor]
        private UDPRouteSpecRules(ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Alpha2.UDPRouteSpecRulesBackendRefs> backendRefs)
        {
            BackendRefs = backendRefs;
        }
    }
}