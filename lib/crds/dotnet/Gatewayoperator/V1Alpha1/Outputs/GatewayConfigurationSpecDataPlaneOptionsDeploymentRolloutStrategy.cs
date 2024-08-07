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
    /// Strategy contains the deployment strategy for rollout.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategy
    {
        /// <summary>
        /// BlueGreen holds the options specific for Blue Green Deployments.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreen BlueGreen;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategy(Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreen blueGreen)
        {
            BlueGreen = blueGreen;
        }
    }
}
