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
    /// MachineHealthCheck defines a MachineHealthCheck for this MachineDeploymentClass.
    /// </summary>
    public class ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Any further remediation is only allowed if at most "MaxUnhealthy" machines selected by "selector" are not healthy.
        /// </summary>
        [Input("maxUnhealthy")]
        public InputUnion<int, string>? MaxUnhealthy { get; set; }

        /// <summary>
        /// Machines older than this duration without a node will be considered to have failed and will be remediated. If you wish to disable this feature, set the value explicitly to 0.
        /// </summary>
        [Input("nodeStartupTimeout")]
        public Input<string>? NodeStartupTimeout { get; set; }

        /// <summary>
        /// RemediationTemplate is a reference to a remediation template provided by an infrastructure provider. 
        ///  This field is completely optional, when filled, the MachineHealthCheck controller creates a new object from the template referenced and hands off remediation of the machine to a controller that lives outside of Cluster API.
        /// </summary>
        [Input("remediationTemplate")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckRemediationTemplateArgs>? RemediationTemplate { get; set; }

        [Input("unhealthyConditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckUnhealthyConditionsArgs>? _unhealthyConditions;

        /// <summary>
        /// UnhealthyConditions contains a list of the conditions that determine whether a node is considered unhealthy. The conditions are combined in a logical OR, i.e. if any of the conditions is met, the node is unhealthy.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckUnhealthyConditionsArgs> UnhealthyConditions
        {
            get => _unhealthyConditions ?? (_unhealthyConditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckUnhealthyConditionsArgs>());
            set => _unhealthyConditions = value;
        }

        /// <summary>
        /// Any further remediation is only allowed if the number of machines selected by "selector" as not healthy is within the range of "UnhealthyRange". Takes precedence over MaxUnhealthy. Eg. "[3-5]" - This means that remediation will be allowed only when: (a) there are at least 3 unhealthy machines (and) (b) there are at most 5 unhealthy machines
        /// </summary>
        [Input("unhealthyRange")]
        public Input<string>? UnhealthyRange { get; set; }

        public ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckArgs()
        {
        }
        public static new ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckArgs Empty => new ClusterClassSpecWorkersMachineDeploymentsMachineHealthCheckArgs();
    }
}
