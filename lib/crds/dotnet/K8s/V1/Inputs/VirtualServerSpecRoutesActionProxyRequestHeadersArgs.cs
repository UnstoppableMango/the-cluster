// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.K8s.V1
{

    /// <summary>
    /// ProxyRequestHeaders defines the request headers manipulation in an ActionProxy.
    /// </summary>
    public class VirtualServerSpecRoutesActionProxyRequestHeadersArgs : global::Pulumi.ResourceArgs
    {
        [Input("pass")]
        public Input<bool>? Pass { get; set; }

        [Input("set")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesActionProxyRequestHeadersSetArgs>? _set;
        public InputList<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesActionProxyRequestHeadersSetArgs> Set
        {
            get => _set ?? (_set = new InputList<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesActionProxyRequestHeadersSetArgs>());
            set => _set = value;
        }

        public VirtualServerSpecRoutesActionProxyRequestHeadersArgs()
        {
        }
        public static new VirtualServerSpecRoutesActionProxyRequestHeadersArgs Empty => new VirtualServerSpecRoutesActionProxyRequestHeadersArgs();
    }
}
