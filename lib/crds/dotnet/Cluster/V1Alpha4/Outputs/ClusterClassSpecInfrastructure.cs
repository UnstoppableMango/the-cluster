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
    /// Infrastructure is a reference to a provider-specific template that holds the details for provisioning infrastructure specific cluster for the underlying provider. The underlying provider is responsible for the implementation of the template to an infrastructure cluster.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecInfrastructure
    {
        /// <summary>
        /// Ref is a required reference to a custom resource offered by a provider.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecInfrastructureRef Ref;

        [OutputConstructor]
        private ClusterClassSpecInfrastructure(Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecInfrastructureRef @ref)
        {
            Ref = @ref;
        }
    }
}
