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
    /// Promotion defines how the operator handles promotion of resources.
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenPromotionArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Strategy indicates how you want the operator to handle the promotion of the preview (green) resources (Deployments and Services) after all workflows and tests succeed, OR if you even want it to break before performing the promotion to allow manual inspection.
        /// </summary>
        [Input("strategy", required: true)]
        public Input<string> Strategy { get; set; } = null!;

        public GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenPromotionArgs()
        {
            Strategy = "BreakBeforePromotion";
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenPromotionArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsDeploymentRolloutStrategyBlueGreenPromotionArgs();
    }
}