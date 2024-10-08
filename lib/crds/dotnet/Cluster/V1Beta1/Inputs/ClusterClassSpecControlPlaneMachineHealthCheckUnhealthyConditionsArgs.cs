// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1
{

    /// <summary>
    /// UnhealthyCondition represents a Node condition type and value with a timeout specified as a duration.  When the named condition has been in the given status for at least the timeout value, a node is considered unhealthy.
    /// </summary>
    public class ClusterClassSpecControlPlaneMachineHealthCheckUnhealthyConditionsArgs : global::Pulumi.ResourceArgs
    {
        [Input("status", required: true)]
        public Input<string> Status { get; set; } = null!;

        [Input("timeout", required: true)]
        public Input<string> Timeout { get; set; } = null!;

        [Input("type", required: true)]
        public Input<string> Type { get; set; } = null!;

        public ClusterClassSpecControlPlaneMachineHealthCheckUnhealthyConditionsArgs()
        {
        }
        public static new ClusterClassSpecControlPlaneMachineHealthCheckUnhealthyConditionsArgs Empty => new ClusterClassSpecControlPlaneMachineHealthCheckUnhealthyConditionsArgs();
    }
}
