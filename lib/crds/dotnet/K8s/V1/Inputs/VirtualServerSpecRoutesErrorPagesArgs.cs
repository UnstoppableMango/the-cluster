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
    /// ErrorPage defines an ErrorPage in a Route.
    /// </summary>
    public class VirtualServerSpecRoutesErrorPagesArgs : global::Pulumi.ResourceArgs
    {
        [Input("codes")]
        private InputList<int>? _codes;
        public InputList<int> Codes
        {
            get => _codes ?? (_codes = new InputList<int>());
            set => _codes = value;
        }

        /// <summary>
        /// ErrorPageRedirect defines a redirect for an ErrorPage.
        /// </summary>
        [Input("redirect")]
        public Input<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesErrorPagesRedirectArgs>? Redirect { get; set; }

        /// <summary>
        /// ErrorPageReturn defines a return for an ErrorPage.
        /// </summary>
        [Input("return")]
        public Input<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesErrorPagesReturnArgs>? Return { get; set; }

        public VirtualServerSpecRoutesErrorPagesArgs()
        {
        }
        public static new VirtualServerSpecRoutesErrorPagesArgs Empty => new VirtualServerSpecRoutesErrorPagesArgs();
    }
}