// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1
{

    /// <summary>
    /// Namespaces indicates namespaces from which Routes may be attached to this Listener. This is restricted to the namespace of this Gateway by default. 
    ///  Support: Core
    /// </summary>
    [OutputType]
    public sealed class GatewaySpecListenersAllowedRoutesNamespaces
    {
        /// <summary>
        /// From indicates where Routes will be selected for this Gateway. Possible values are: 
        ///  * All: Routes in all namespaces may be used by this Gateway. * Selector: Routes in namespaces selected by the selector may be used by this Gateway. * Same: Only Routes in the same namespace may be used by this Gateway. 
        ///  Support: Core
        /// </summary>
        public readonly string From;
        /// <summary>
        /// Selector must be specified when From is set to "Selector". In that case, only Routes in Namespaces matching this Selector will be selected by this Gateway. This field is ignored for other values of "From". 
        ///  Support: Core
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewaySpecListenersAllowedRoutesNamespacesSelector Selector;

        [OutputConstructor]
        private GatewaySpecListenersAllowedRoutesNamespaces(
            string from,

            Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewaySpecListenersAllowedRoutesNamespacesSelector selector)
        {
            From = from;
            Selector = selector;
        }
    }
}