// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// ByoClusterStatus defines the observed state of ByoCluster
    /// </summary>
    public class ByoClusterStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ByoClusterStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions defines current service state of the ByoCluster.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ByoClusterStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ByoClusterStatusConditionsArgs>());
            set => _conditions = value;
        }

        [Input("failureDomains")]
        private InputMap<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ByoClusterStatusFailureDomainsArgs>? _failureDomains;

        /// <summary>
        /// FailureDomains is a list of failure domain objects synced from the infrastructure provider.
        /// </summary>
        public InputMap<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ByoClusterStatusFailureDomainsArgs> FailureDomains
        {
            get => _failureDomains ?? (_failureDomains = new InputMap<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ByoClusterStatusFailureDomainsArgs>());
            set => _failureDomains = value;
        }

        [Input("ready")]
        public Input<bool>? Ready { get; set; }

        public ByoClusterStatusArgs()
        {
        }
        public static new ByoClusterStatusArgs Empty => new ByoClusterStatusArgs();
    }
}
