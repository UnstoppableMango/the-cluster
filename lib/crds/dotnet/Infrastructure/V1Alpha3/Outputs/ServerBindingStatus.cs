// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Alpha3
{

    /// <summary>
    /// ServerBindingState defines the observed state of ServerBinding.
    /// </summary>
    [OutputType]
    public sealed class ServerBindingStatus
    {
        /// <summary>
        /// Conditions defines current state of the ServerBinding.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Alpha3.ServerBindingStatusConditions> Conditions;
        /// <summary>
        /// Ready is true when matching server is found.
        /// </summary>
        public readonly bool Ready;

        [OutputConstructor]
        private ServerBindingStatus(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Alpha3.ServerBindingStatusConditions> conditions,

            bool ready)
        {
            Conditions = conditions;
            Ready = ready;
        }
    }
}
