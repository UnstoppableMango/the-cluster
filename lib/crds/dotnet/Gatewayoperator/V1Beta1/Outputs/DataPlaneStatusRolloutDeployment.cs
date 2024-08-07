// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// Deployment contains the information about the preview deployment.
    /// </summary>
    [OutputType]
    public sealed class DataPlaneStatusRolloutDeployment
    {
        /// <summary>
        /// Selector is a stable label selector value assigned to a DataPlane rollout status which is used throughout the rollout as a deterministic labels selector for Services and Deployments.
        /// </summary>
        public readonly string Selector;

        [OutputConstructor]
        private DataPlaneStatusRolloutDeployment(string selector)
        {
            Selector = selector;
        }
    }
}
