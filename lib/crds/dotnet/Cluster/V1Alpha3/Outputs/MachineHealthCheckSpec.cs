// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3
{

    /// <summary>
    /// Specification of machine health check policy
    /// </summary>
    [OutputType]
    public sealed class MachineHealthCheckSpec
    {
        /// <summary>
        /// ClusterName is the name of the Cluster this object belongs to.
        /// </summary>
        public readonly string ClusterName;
        /// <summary>
        /// Any further remediation is only allowed if at most "MaxUnhealthy" machines selected by "selector" are not healthy.
        /// </summary>
        public readonly Union<int, string> MaxUnhealthy;
        /// <summary>
        /// Machines older than this duration without a node will be considered to have failed and will be remediated.
        /// </summary>
        public readonly string NodeStartupTimeout;
        /// <summary>
        /// RemediationTemplate is a reference to a remediation template provided by an infrastructure provider. 
        ///  This field is completely optional, when filled, the MachineHealthCheck controller creates a new object from the template referenced and hands off remediation of the machine to a controller that lives outside of Cluster API.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3.MachineHealthCheckSpecRemediationTemplate RemediationTemplate;
        /// <summary>
        /// Label selector to match machines whose health will be exercised
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3.MachineHealthCheckSpecSelector Selector;
        /// <summary>
        /// UnhealthyConditions contains a list of the conditions that determine whether a node is considered unhealthy.  The conditions are combined in a logical OR, i.e. if any of the conditions is met, the node is unhealthy.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3.MachineHealthCheckSpecUnhealthyConditions> UnhealthyConditions;

        [OutputConstructor]
        private MachineHealthCheckSpec(
            string clusterName,

            Union<int, string> maxUnhealthy,

            string nodeStartupTimeout,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3.MachineHealthCheckSpecRemediationTemplate remediationTemplate,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3.MachineHealthCheckSpecSelector selector,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha3.MachineHealthCheckSpecUnhealthyConditions> unhealthyConditions)
        {
            ClusterName = clusterName;
            MaxUnhealthy = maxUnhealthy;
            NodeStartupTimeout = nodeStartupTimeout;
            RemediationTemplate = remediationTemplate;
            Selector = selector;
            UnhealthyConditions = unhealthyConditions;
        }
    }
}