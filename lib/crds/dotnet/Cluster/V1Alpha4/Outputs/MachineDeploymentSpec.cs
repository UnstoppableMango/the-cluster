// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4
{

    /// <summary>
    /// MachineDeploymentSpec defines the desired state of MachineDeployment.
    /// </summary>
    [OutputType]
    public sealed class MachineDeploymentSpec
    {
        /// <summary>
        /// ClusterName is the name of the Cluster this object belongs to.
        /// </summary>
        public readonly string ClusterName;
        /// <summary>
        /// Minimum number of seconds for which a newly created machine should be ready. Defaults to 0 (machine will be considered available as soon as it is ready)
        /// </summary>
        public readonly int MinReadySeconds;
        /// <summary>
        /// Indicates that the deployment is paused.
        /// </summary>
        public readonly bool Paused;
        /// <summary>
        /// The maximum time in seconds for a deployment to make progress before it is considered to be failed. The deployment controller will continue to process failed deployments and a condition with a ProgressDeadlineExceeded reason will be surfaced in the deployment status. Note that progress will not be estimated during the time a deployment is paused. Defaults to 600s.
        /// </summary>
        public readonly int ProgressDeadlineSeconds;
        /// <summary>
        /// Number of desired machines. Defaults to 1. This is a pointer to distinguish between explicit zero and not specified.
        /// </summary>
        public readonly int Replicas;
        /// <summary>
        /// The number of old MachineSets to retain to allow rollback. This is a pointer to distinguish between explicit zero and not specified. Defaults to 1.
        /// </summary>
        public readonly int RevisionHistoryLimit;
        /// <summary>
        /// Label selector for machines. Existing MachineSets whose machines are selected by this will be the ones affected by this deployment. It must match the machine template's labels.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachineDeploymentSpecSelector Selector;
        /// <summary>
        /// The deployment strategy to use to replace existing machines with new ones.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachineDeploymentSpecStrategy Strategy;
        /// <summary>
        /// Template describes the machines that will be created.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachineDeploymentSpecTemplate Template;

        [OutputConstructor]
        private MachineDeploymentSpec(
            string clusterName,

            int minReadySeconds,

            bool paused,

            int progressDeadlineSeconds,

            int replicas,

            int revisionHistoryLimit,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachineDeploymentSpecSelector selector,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachineDeploymentSpecStrategy strategy,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachineDeploymentSpecTemplate template)
        {
            ClusterName = clusterName;
            MinReadySeconds = minReadySeconds;
            Paused = paused;
            ProgressDeadlineSeconds = progressDeadlineSeconds;
            Replicas = replicas;
            RevisionHistoryLimit = revisionHistoryLimit;
            Selector = selector;
            Strategy = strategy;
            Template = template;
        }
    }
}