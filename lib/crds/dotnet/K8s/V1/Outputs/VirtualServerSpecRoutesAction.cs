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
    /// Action defines an action.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesAction
    {
        public readonly string Pass;
        /// <summary>
        /// ActionProxy defines a proxy in an Action.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionProxy Proxy;
        /// <summary>
        /// ActionRedirect defines a redirect in an Action.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionRedirect Redirect;
        /// <summary>
        /// ActionReturn defines a return in an Action.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionReturn Return;

        [OutputConstructor]
        private VirtualServerSpecRoutesAction(
            string pass,

            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionProxy proxy,

            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionRedirect redirect,

            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionReturn @return)
        {
            Pass = pass;
            Proxy = proxy;
            Redirect = redirect;
            Return = @return;
        }
    }
}
