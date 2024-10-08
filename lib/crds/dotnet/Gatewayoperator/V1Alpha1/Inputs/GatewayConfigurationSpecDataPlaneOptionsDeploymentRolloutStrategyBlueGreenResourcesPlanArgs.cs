// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// Plan defines the resource plan for managing resources during and after a rollout.
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResourcesPlanArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Deployment describes how the operator manages Deployments during and after a rollout.
        /// </summary>
        [Input("deployment")]
        public Input<string>? Deployment { get; set; }

        public GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResourcesPlanArgs()
        {
            Deployment = "ScaleDownOnPromotionScaleUpOnRollout";
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResourcesPlanArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenResourcesPlanArgs();
    }
}
