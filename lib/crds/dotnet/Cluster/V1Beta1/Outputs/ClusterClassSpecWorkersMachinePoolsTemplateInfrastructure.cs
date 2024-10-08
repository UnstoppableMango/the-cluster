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
    /// Infrastructure contains the infrastructure template reference to be used for the creation of the MachinePool.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecWorkersMachinePoolsTemplateInfrastructure
    {
        /// <summary>
        /// Ref is a required reference to a custom resource offered by a provider.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateInfrastructureRef Ref;

        [OutputConstructor]
        private ClusterClassSpecWorkersMachinePoolsTemplateInfrastructure(Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateInfrastructureRef @ref)
        {
            Ref = @ref;
        }
    }
}
