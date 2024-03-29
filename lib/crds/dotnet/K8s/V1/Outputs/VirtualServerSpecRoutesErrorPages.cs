// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.K8s.V1
{

    /// <summary>
    /// ErrorPage defines an ErrorPage in a Route.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesErrorPages
    {
        public readonly ImmutableArray<int> Codes;
        /// <summary>
        /// ErrorPageRedirect defines a redirect for an ErrorPage.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesErrorPagesRedirect Redirect;
        /// <summary>
        /// ErrorPageReturn defines a return for an ErrorPage.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesErrorPagesReturn Return;

        [OutputConstructor]
        private VirtualServerSpecRoutesErrorPages(
            ImmutableArray<int> codes,

            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesErrorPagesRedirect redirect,

            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesErrorPagesReturn @return)
        {
            Codes = codes;
            Redirect = redirect;
            Return = @return;
        }
    }
}
