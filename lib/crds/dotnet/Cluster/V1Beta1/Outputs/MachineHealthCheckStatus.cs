// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1
{

    /// <summary>
    /// Most recently observed status of MachineHealthCheck resource
    /// </summary>
    [OutputType]
    public sealed class MachineHealthCheckStatus
    {
        /// <summary>
        /// Conditions defines current service state of the MachineHealthCheck.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineHealthCheckStatusConditions> Conditions;
        /// <summary>
        /// total number of healthy machines counted by this machine health check
        /// </summary>
        public readonly int CurrentHealthy;
        /// <summary>
        /// total number of machines counted by this machine health check
        /// </summary>
        public readonly int ExpectedMachines;
        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        public readonly int ObservedGeneration;
        /// <summary>
        /// RemediationsAllowed is the number of further remediations allowed by this machine health check before maxUnhealthy short circuiting will be applied
        /// </summary>
        public readonly int RemediationsAllowed;
        /// <summary>
        /// Targets shows the current list of machines the machine health check is watching
        /// </summary>
        public readonly ImmutableArray<string> Targets;

        [OutputConstructor]
        private MachineHealthCheckStatus(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineHealthCheckStatusConditions> conditions,

            int currentHealthy,

            int expectedMachines,

            int observedGeneration,

            int remediationsAllowed,

            ImmutableArray<string> targets)
        {
            Conditions = conditions;
            CurrentHealthy = currentHealthy;
            ExpectedMachines = expectedMachines;
            ObservedGeneration = observedGeneration;
            RemediationsAllowed = remediationsAllowed;
            Targets = targets;
        }
    }
}