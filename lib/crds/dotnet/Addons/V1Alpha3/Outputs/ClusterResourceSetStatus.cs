// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Addons.V1Alpha3
{

    /// <summary>
    /// ClusterResourceSetStatus defines the observed state of ClusterResourceSet.
    /// </summary>
    [OutputType]
    public sealed class ClusterResourceSetStatus
    {
        /// <summary>
        /// Conditions defines current state of the ClusterResourceSet.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Addons.V1Alpha3.ClusterResourceSetStatusConditions> Conditions;
        /// <summary>
        /// ObservedGeneration reflects the generation of the most recently observed ClusterResourceSet.
        /// </summary>
        public readonly int ObservedGeneration;

        [OutputConstructor]
        private ClusterResourceSetStatus(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Addons.V1Alpha3.ClusterResourceSetStatusConditions> conditions,

            int observedGeneration)
        {
            Conditions = conditions;
            ObservedGeneration = observedGeneration;
        }
    }
}