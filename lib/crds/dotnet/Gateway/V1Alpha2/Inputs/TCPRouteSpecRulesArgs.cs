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
    /// TCPRouteRule is the configuration for a given rule.
    /// </summary>
    public class TCPRouteSpecRulesArgs : global::Pulumi.ResourceArgs
    {
        [Input("backendRefs")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.TCPRouteSpecRulesBackendRefsArgs>? _backendRefs;

        /// <summary>
        /// BackendRefs defines the backend(s) where matching requests should be sent. If unspecified or invalid (refers to a non-existent resource or a Service with no endpoints), the underlying implementation MUST actively reject connection attempts to this backend. Connection rejections must respect weight; if an invalid backend is requested to have 80% of connections, then 80% of connections must be rejected instead. 
        ///  Support: Core for Kubernetes Service 
        ///  Support: Extended for Kubernetes ServiceImport 
        ///  Support: Implementation-specific for any other resource 
        ///  Support for weight: Extended
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.TCPRouteSpecRulesBackendRefsArgs> BackendRefs
        {
            get => _backendRefs ?? (_backendRefs = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.TCPRouteSpecRulesBackendRefsArgs>());
            set => _backendRefs = value;
        }

        public TCPRouteSpecRulesArgs()
        {
        }
        public static new TCPRouteSpecRulesArgs Empty => new TCPRouteSpecRulesArgs();
    }
}
