// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// Deployment contains the information about the preview deployment.
    /// </summary>
    public class DataPlaneStatusRolloutDeploymentArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Selector is a stable label selector value assigned to a DataPlane rollout status which is used throughout the rollout as a deterministic labels selector for Services and Deployments.
        /// </summary>
        [Input("selector")]
        public Input<string>? Selector { get; set; }

        public DataPlaneStatusRolloutDeploymentArgs()
        {
        }
        public static new DataPlaneStatusRolloutDeploymentArgs Empty => new DataPlaneStatusRolloutDeploymentArgs();
    }
}