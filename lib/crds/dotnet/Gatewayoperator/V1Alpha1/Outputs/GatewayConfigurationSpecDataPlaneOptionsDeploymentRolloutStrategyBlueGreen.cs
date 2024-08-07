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
    /// BlueGreen holds the options specific for Blue Green Deployments.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreen
    {
        /// <summary>
        /// Promotion defines how the operator handles promotion of resources.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenPromotion Promotion;
        /// <summary>
        /// Resources controls what happens to operator managed resources during or after a rollout.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResources Resources;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreen(
            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenPromotion promotion,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResources resources)
        {
            Promotion = promotion;
            Resources = resources;
        }
    }
}
