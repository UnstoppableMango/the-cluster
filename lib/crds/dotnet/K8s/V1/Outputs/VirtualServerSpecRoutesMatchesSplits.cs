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
    /// Split defines a split.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesMatchesSplits
    {
        /// <summary>
        /// Action defines an action.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesMatchesSplitsAction Action;
        public readonly int Weight;

        [OutputConstructor]
        private VirtualServerSpecRoutesMatchesSplits(
            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesMatchesSplitsAction action,

            int weight)
        {
            Action = action;
            Weight = weight;
        }
    }
}