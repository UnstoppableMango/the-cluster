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
    /// Promotion defines how the operator handles promotion of resources.
    /// </summary>
    [OutputType]
    public sealed class DataPlaneSpecDeploymentRolloutStrategyBlueGreenPromotion
    {
        /// <summary>
        /// Strategy indicates how you want the operator to handle the promotion of the preview (green) resources (Deployments and Services) after all workflows and tests succeed, OR if you even want it to break before performing the promotion to allow manual inspection.
        /// </summary>
        public readonly string Strategy;

        [OutputConstructor]
        private DataPlaneSpecDeploymentRolloutStrategyBlueGreenPromotion(string strategy)
        {
            Strategy = strategy;
        }
    }
}