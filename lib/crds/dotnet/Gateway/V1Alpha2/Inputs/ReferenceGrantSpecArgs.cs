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
    /// Spec defines the desired state of ReferenceGrant.
    /// </summary>
    public class ReferenceGrantSpecArgs : global::Pulumi.ResourceArgs
    {
        [Input("from", required: true)]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.ReferenceGrantSpecFromArgs>? _from;

        /// <summary>
        /// From describes the trusted namespaces and kinds that can reference the resources described in "To". Each entry in this list MUST be considered to be an additional place that references can be valid from, or to put this another way, entries MUST be combined using OR. 
        ///  Support: Core
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.ReferenceGrantSpecFromArgs> From
        {
            get => _from ?? (_from = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.ReferenceGrantSpecFromArgs>());
            set => _from = value;
        }

        [Input("to", required: true)]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.ReferenceGrantSpecToArgs>? _to;

        /// <summary>
        /// To describes the resources that may be referenced by the resources described in "From". Each entry in this list MUST be considered to be an additional place that references can be valid to, or to put this another way, entries MUST be combined using OR. 
        ///  Support: Core
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.ReferenceGrantSpecToArgs> To
        {
            get => _to ?? (_to = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Alpha2.ReferenceGrantSpecToArgs>());
            set => _to = value;
        }

        public ReferenceGrantSpecArgs()
        {
        }
        public static new ReferenceGrantSpecArgs Empty => new ReferenceGrantSpecArgs();
    }
}