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
    /// MatchResources selects templates based on where they are referenced.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecPatchesDefinitionsSelectorMatchResources
    {
        /// <summary>
        /// ControlPlane selects templates referenced in .spec.ControlPlane. Note: this will match the controlPlane and also the controlPlane machineInfrastructure (depending on the kind and apiVersion).
        /// </summary>
        public readonly bool ControlPlane;
        /// <summary>
        /// InfrastructureCluster selects templates referenced in .spec.infrastructure.
        /// </summary>
        public readonly bool InfrastructureCluster;
        /// <summary>
        /// MachineDeploymentClass selects templates referenced in specific MachineDeploymentClasses in .spec.workers.machineDeployments.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsSelectorMatchResourcesMachineDeploymentClass MachineDeploymentClass;
        /// <summary>
        /// MachinePoolClass selects templates referenced in specific MachinePoolClasses in .spec.workers.machinePools.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsSelectorMatchResourcesMachinePoolClass MachinePoolClass;

        [OutputConstructor]
        private ClusterClassSpecPatchesDefinitionsSelectorMatchResources(
            bool controlPlane,

            bool infrastructureCluster,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsSelectorMatchResourcesMachineDeploymentClass machineDeploymentClass,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsSelectorMatchResourcesMachinePoolClass machinePoolClass)
        {
            ControlPlane = controlPlane;
            InfrastructureCluster = infrastructureCluster;
            MachineDeploymentClass = machineDeploymentClass;
            MachinePoolClass = machinePoolClass;
        }
    }
}
