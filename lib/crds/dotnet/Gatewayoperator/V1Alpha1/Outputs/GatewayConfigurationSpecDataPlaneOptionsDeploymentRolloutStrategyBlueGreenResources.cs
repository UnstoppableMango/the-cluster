// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// Resources controls what happens to operator managed resources during or after a rollout.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResources
    {
        /// <summary>
        /// Plan defines the resource plan for managing resources during and after a rollout.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResourcesPlan Plan;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResources(Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResourcesPlan plan)
        {
            Plan = plan;
        }
    }
}